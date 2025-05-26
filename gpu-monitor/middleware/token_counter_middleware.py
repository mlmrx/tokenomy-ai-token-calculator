
"""
Token Counter Middleware for GPU Token Throughput Monitoring

This middleware tracks token counts for inference requests and exposes
Prometheus metrics via HTTP endpoint.
"""

import time
import threading
from collections import defaultdict, deque
from typing import Dict, Any, Optional
from prometheus_client import Counter, Gauge, generate_latest, CONTENT_TYPE_LATEST
from flask import Flask, Response
import logging

logger = logging.getLogger(__name__)

class TokenCounterMiddleware:
    """Middleware to track token processing metrics per GPU."""
    
    def __init__(self, max_history_size: int = 1000):
        self.max_history_size = max_history_size
        self.lock = threading.RLock()
        
        # Prometheus metrics
        self.tokens_prompt_counter = Counter(
            'tokens_prompt_total',
            'Total prompt tokens processed',
            ['gpu_uuid', 'model_id']
        )
        
        self.tokens_generated_counter = Counter(
            'tokens_generated_total', 
            'Total generated tokens',
            ['gpu_uuid', 'model_id']
        )
        
        self.current_tps_gauge = Gauge(
            'gpu_current_tps',
            'Current tokens per second',
            ['gpu_uuid']
        )
        
        self.avg_tps_1m_gauge = Gauge(
            'gpu_avg_tps_1m',
            'Average tokens per second over 1 minute',
            ['gpu_uuid']
        )
        
        self.cost_per_mtoken_gauge = Gauge(
            'gpu_cost_per_mtoken',
            'Cost per million tokens in USD',
            ['gpu_uuid', 'model_id']
        )
        
        self.energy_per_mtoken_gauge = Gauge(
            'gpu_energy_per_mtoken',
            'Energy per million tokens in Wh',
            ['gpu_uuid']
        )
        
        # Internal tracking
        self.token_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=self.max_history_size))
        self.last_update: Dict[str, float] = {}
        
        # GPU cost and power mappings (in production, load from YAML)
        self.gpu_costs = {
            'A100': 2.50,  # USD per hour
            'V100': 1.20,
            'RTX4090': 0.80,
            'H100': 4.00
        }
        
        self.gpu_power_draw = {
            'A100': 400,  # Watts
            'V100': 300,
            'RTX4090': 450,
            'H100': 700
        }
    
    def record_inference(self, 
                        gpu_uuid: str,
                        model_id: str,
                        tokens_prompt: int,
                        tokens_generated: int,
                        gpu_sku: Optional[str] = None,
                        timestamp: Optional[float] = None) -> None:
        """Record an inference event with token counts."""
        
        if timestamp is None:
            timestamp = time.time()
            
        total_tokens = tokens_prompt + tokens_generated
        
        with self.lock:
            # Update Prometheus counters
            self.tokens_prompt_counter.labels(
                gpu_uuid=gpu_uuid, 
                model_id=model_id
            ).inc(tokens_prompt)
            
            self.tokens_generated_counter.labels(
                gpu_uuid=gpu_uuid,
                model_id=model_id  
            ).inc(tokens_generated)
            
            # Track token history for TPS calculations
            self.token_history[gpu_uuid].append({
                'timestamp': timestamp,
                'tokens': total_tokens,
                'model_id': model_id
            })
            
            self.last_update[gpu_uuid] = timestamp
            
            # Calculate and update TPS metrics
            self._update_tps_metrics(gpu_uuid)
            
            # Calculate and update cost/energy metrics
            if gpu_sku:
                self._update_cost_energy_metrics(gpu_uuid, model_id, gpu_sku, total_tokens)
    
    def _update_tps_metrics(self, gpu_uuid: str) -> None:
        """Update TPS metrics for a specific GPU."""
        history = self.token_history[gpu_uuid]
        
        if len(history) < 2:
            return
            
        now = time.time()
        
        # Current TPS (5-second window)
        recent_events = [e for e in history if now - e['timestamp'] <= 5.0]
        if len(recent_events) >= 2:
            time_span = recent_events[-1]['timestamp'] - recent_events[0]['timestamp']
            total_tokens = sum(e['tokens'] for e in recent_events)
            current_tps = total_tokens / max(time_span, 1.0)
            self.current_tps_gauge.labels(gpu_uuid=gpu_uuid).set(current_tps)
        
        # 1-minute average TPS
        minute_events = [e for e in history if now - e['timestamp'] <= 60.0]
        if len(minute_events) >= 2:
            time_span = minute_events[-1]['timestamp'] - minute_events[0]['timestamp']
            total_tokens = sum(e['tokens'] for e in minute_events)
            avg_tps_1m = total_tokens / max(time_span, 1.0)
            self.avg_tps_1m_gauge.labels(gpu_uuid=gpu_uuid).set(avg_tps_1m)
    
    def _update_cost_energy_metrics(self, 
                                   gpu_uuid: str, 
                                   model_id: str,
                                   gpu_sku: str,
                                   total_tokens: int) -> None:
        """Update cost and energy efficiency metrics."""
        
        # Get current TPS for calculations
        current_tps = self.current_tps_gauge.labels(gpu_uuid=gpu_uuid)._value._value
        
        if current_tps > 0:
            # Cost per million tokens calculation
            hourly_cost = self.gpu_costs.get(gpu_sku, 2.50)
            cost_per_mtoken = (hourly_cost / (current_tps * 3600)) * 1e6
            
            self.cost_per_mtoken_gauge.labels(
                gpu_uuid=gpu_uuid,
                model_id=model_id
            ).set(cost_per_mtoken)
            
            # Energy per million tokens calculation
            power_draw_w = self.gpu_power_draw.get(gpu_sku, 400)
            energy_per_mtoken = (power_draw_w / current_tps) * (1e6 / 3600 / 1000)  # Wh
            
            self.energy_per_mtoken_gauge.labels(gpu_uuid=gpu_uuid).set(energy_per_mtoken)
    
    def get_gpu_metrics(self, gpu_uuid: str) -> Dict[str, Any]:
        """Get current metrics for a specific GPU."""
        with self.lock:
            history = self.token_history[gpu_uuid]
            
            if not history:
                return {}
                
            current_tps = self.current_tps_gauge.labels(gpu_uuid=gpu_uuid)._value._value
            avg_tps_1m = self.avg_tps_1m_gauge.labels(gpu_uuid=gpu_uuid)._value._value
            
            total_tokens = sum(e['tokens'] for e in history)
            
            return {
                'gpu_uuid': gpu_uuid,
                'current_tps': current_tps,
                'avg_tps_1m': avg_tps_1m,
                'tokens_total': total_tokens,
                'last_updated': self.last_update.get(gpu_uuid, 0),
                'health_status': self._calculate_health_status(gpu_uuid)
            }
    
    def _calculate_health_status(self, gpu_uuid: str) -> str:
        """Calculate health status based on performance metrics."""
        current_tps = self.current_tps_gauge.labels(gpu_uuid=gpu_uuid)._value._value
        avg_tps_1m = self.avg_tps_1m_gauge.labels(gpu_uuid=gpu_uuid)._value._value
        
        if current_tps == 0:
            return 'critical'
        
        if avg_tps_1m > 0:
            efficiency = current_tps / avg_tps_1m
            if efficiency >= 0.9:
                return 'healthy'
            elif efficiency >= 0.8:
                return 'warning'
            else:
                return 'critical'
        
        return 'healthy'
    
    def get_all_gpu_metrics(self) -> list:
        """Get metrics for all tracked GPUs."""
        with self.lock:
            return [
                self.get_gpu_metrics(gpu_uuid) 
                for gpu_uuid in self.token_history.keys()
            ]


# Flask app for Prometheus metrics endpoint
def create_metrics_app(middleware: TokenCounterMiddleware) -> Flask:
    """Create Flask app to serve Prometheus metrics."""
    app = Flask(__name__)
    
    @app.route('/metrics')
    def metrics():
        """Prometheus metrics endpoint."""
        return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)
    
    @app.route('/gpu/<gpu_uuid>/metrics')
    def gpu_metrics(gpu_uuid: str):
        """Get metrics for specific GPU in JSON format."""
        from flask import jsonify
        return jsonify(middleware.get_gpu_metrics(gpu_uuid))
    
    @app.route('/health')
    def health():
        """Health check endpoint."""
        return {'status': 'healthy', 'timestamp': time.time()}
    
    return app


# Example usage
if __name__ == '__main__':
    # Initialize middleware
    middleware = TokenCounterMiddleware()
    
    # Create Flask app
    app = create_metrics_app(middleware)
    
    # Example: Record some inference events
    import random
    import threading
    
    def simulate_inference():
        """Simulate inference events for testing."""
        gpu_uuids = ['gpu-001', 'gpu-002', 'gpu-003']
        models = ['llama-7b', 'gpt-3.5', 'claude-2']
        gpu_skus = ['A100', 'V100', 'H100']
        
        while True:
            gpu_uuid = random.choice(gpu_uuids)
            model_id = random.choice(models)
            gpu_sku = random.choice(gpu_skus)
            
            middleware.record_inference(
                gpu_uuid=gpu_uuid,
                model_id=model_id,
                tokens_prompt=random.randint(50, 500),
                tokens_generated=random.randint(100, 1000),
                gpu_sku=gpu_sku
            )
            
            time.sleep(random.uniform(0.1, 2.0))
    
    # Start simulation thread
    sim_thread = threading.Thread(target=simulate_inference, daemon=True)
    sim_thread.start()
    
    # Run Flask app
    logger.info("Starting GPU Token Counter Middleware on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
