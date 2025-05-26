package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	dto "github.com/prometheus/client_model/go"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

// Enhanced TokenSample with additional fields
type TokenSample struct {
	GPUUUID         string  `json:"gpu_uuid"`
	TokensProcessed int64   `json:"tokens_processed"`
	WindowNS        int64   `json:"window_ns"`
	ModelID         string  `json:"model_id,omitempty"`
	Origin          string  `json:"origin"` // "vendor" or "inference"
	Timestamp       int64   `json:"timestamp,omitempty"`
	PowerDraw       float64 `json:"power_draw_w,omitempty"`
	Temperature     float64 `json:"temperature_c,omitempty"`
	MemoryUsage     float64 `json:"memory_usage_mb,omitempty"`
	GPUUtilization  float64 `json:"gpu_utilization_pct,omitempty"`
}

// DCGM metrics structure
type DCGMMetrics struct {
	GPUUUID        string  `json:"gpu_uuid"`
	TokensTotal    int64   `json:"dcgm_gpu_tokens_total"`
	PowerDraw      float64 `json:"dcgm_power_draw_watts"`
	Temperature    float64 `json:"dcgm_temperature_celsius"`
	MemoryUsed     float64 `json:"dcgm_memory_used_mb"`
	GPUUtilization float64 `json:"dcgm_gpu_utilization_percent"`
	Timestamp      int64   `json:"timestamp"`
}

// Enhanced GPU metrics with cost and energy calculations
type enhancedGpuMetrics struct {
	// Existing metrics
	tokensTotal prometheus.Counter
	tps         prometheus.Gauge
	tps1m       prometheus.Gauge

	// New enhanced metrics
	tokensPrompt     prometheus.Counter
	tokensGenerated  prometheus.Counter
	costPerMToken    prometheus.Gauge
	energyPerMToken  prometheus.Gauge
	powerDraw        prometheus.Gauge
	temperature      prometheus.Gauge
	memoryUsage      prometheus.Gauge
	gpuUtilization   prometheus.Gauge
	healthStatus     prometheus.Gauge

	// Internal state
	mu              sync.Mutex
	history         []tpsRecord
	lastVendorCount int64
	lastInfCount    int64
	lastUpdate      time.Time
	gpuSKU          string
	modelID         string
}

type tpsRecord struct {
	timestamp time.Time
	tps       float64
	origin    string
}

// Configuration for GPU costs and power consumption
type GPUConfig struct {
	SKU         string  `json:"sku"`
	HourlyCost  float64 `json:"hourly_cost_usd"`
	PowerDrawW  float64 `json:"typical_power_draw_watts"`
	MaxTemp     float64 `json:"max_temperature_celsius"`
	MaxMemoryMB float64 `json:"max_memory_mb"`
}

var (
	gpuMap        = map[string]*enhancedGpuMetrics{}
	registry      = prometheus.NewRegistry()
	logger        *zap.Logger
	gpuConfigs    map[string]GPUConfig
	driftCounter  prometheus.Counter
	reconcileGauge prometheus.Gauge
)

func init() {
	// Initialize logger
	var err error
	logger, err = zap.NewProduction()
	if err != nil {
		log.Fatal("Failed to initialize logger:", err)
	}

	// Initialize drift tracking metrics
	driftCounter = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "gpu_token_drift_total",
		Help: "Total number of token count drift events detected",
	})

	reconcileGauge = prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "gpu_token_reconcile_accuracy",
		Help: "Accuracy percentage of vendor vs inference token counts",
	})

	registry.MustRegister(driftCounter, reconcileGauge)

	// Load GPU configurations (in production, load from YAML file)
	gpuConfigs = map[string]GPUConfig{
		"A100": {SKU: "A100", HourlyCost: 2.50, PowerDrawW: 400, MaxTemp: 83, MaxMemoryMB: 81920},
		"V100": {SKU: "V100", HourlyCost: 1.20, PowerDrawW: 300, MaxTemp: 80, MaxMemoryMB: 32768},
		"H100": {SKU: "H100", HourlyCost: 4.00, PowerDrawW: 700, MaxTemp: 85, MaxMemoryMB: 81920},
		"RTX4090": {SKU: "RTX4090", HourlyCost: 0.80, PowerDrawW: 450, MaxTemp: 90, MaxMemoryMB: 24576},
	}
}

func getEnhancedMetrics(uuid string, sku string) *enhancedGpuMetrics {
	if m, ok := gpuMap[uuid]; ok {
		return m
	}

	m := &enhancedGpuMetrics{
		tokensTotal: prometheus.NewCounter(prometheus.CounterOpts{
			Name:        "gpu_tokens_total",
			Help:        "Total tokens processed",
			ConstLabels: prometheus.Labels{"gpu_uuid": uuid, "origin": "combined"},
		}),
		tps: prometheus.NewGauge(prometheus.GaugeOpts{
			Name:        "gpu_tps",
			Help:        "Current tokens per second",
			ConstLabels: prometheus.Labels{"gpu_uuid": uuid},
		}),
		tps1m: prometheus.NewGauge(prometheus.GaugeOpts{
			Name:        "gpu_tps_1m",
			Help:        "Average tokens per second over 1 minute",
			ConstLabels: prometheus.Labels{"gpu_uuid": uuid},
		}),
		tokensPrompt: prometheus.NewCounter(prometheus.CounterOpts{
			Name:        "gpu_tokens_prompt_total",
			Help:        "Total prompt tokens processed",
			ConstLabels: prometheus.Labels{"gpu_uuid": uuid},
		}),
		tokensGenerated: prometheus.NewCounter(prometheus.CounterOpts{
			Name:        "gpu_tokens_generated_total",
			Help:        "Total generated tokens",
			ConstLabels: prometheus.Labels{"gpu_uuid": uuid},
		}),
		costPerMToken: prometheus.NewGauge(prometheus.GaugeOpts{
			Name:        "gpu_cost_per_mtoken_usd",
			Help:        "Cost per million tokens in USD",
			ConstLabels: prometheus.Labels{"gpu_uuid": uuid},
		}),
		energyPerMToken: prometheus.NewGauge(prometheus.GaugeOpts{
			Name:        "gpu_energy_per_mtoken_wh",
			Help:        "Energy per million tokens in Wh",
			ConstLabels: prometheus.Labels{"gpu_uuid": uuid},
		}),
		powerDraw: prometheus.NewGauge(prometheus.GaugeOpts{
			Name:        "gpu_power_draw_watts",
			Help:        "Current power draw in watts",
			ConstLabels: prometheus.Labels{"gpu_uuid": uuid},
		}),
		temperature: prometheus.NewGauge(prometheus.GaugeOpts{
			Name:        "gpu_temperature_celsius",
			Help:        "GPU temperature in Celsius",
			ConstLabels: prometheus.Labels{"gpu_uuid": uuid},
		}),
		memoryUsage: prometheus.NewGauge(prometheus.GaugeOpts{
			Name:        "gpu_memory_usage_mb",
			Help:        "GPU memory usage in MB",
			ConstLabels: prometheus.Labels{"gpu_uuid": uuid},
		}),
		gpuUtilization: prometheus.NewGauge(prometheus.GaugeOpts{
			Name:        "gpu_utilization_percent",
			Help:        "GPU utilization percentage",
			ConstLabels: prometheus.Labels{"gpu_uuid": uuid},
		}),
		healthStatus: prometheus.NewGauge(prometheus.GaugeOpts{
			Name:        "gpu_health_status",
			Help:        "GPU health status (0=critical, 1=warning, 2=healthy)",
			ConstLabels: prometheus.Labels{"gpu_uuid": uuid},
		}),
		history:    make([]tpsRecord, 0, 60), // Store 1 minute of data
		lastUpdate: time.Now(),
		gpuSKU:     sku,
	}

	// Register all metrics
	registry.MustRegister(
		m.tokensTotal, m.tps, m.tps1m, m.tokensPrompt, m.tokensGenerated,
		m.costPerMToken, m.energyPerMToken, m.powerDraw, m.temperature,
		m.memoryUsage, m.gpuUtilization, m.healthStatus,
	)

	gpuMap[uuid] = m
	return m
}

func (m *enhancedGpuMetrics) updateMetrics(sample TokenSample) {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Update token counters
	m.tokensTotal.Add(float64(sample.TokensProcessed))

	// Calculate TPS
	tps := float64(sample.TokensProcessed) / (float64(sample.WindowNS) / 1e9)
	m.tps.Set(tps)

	// Update TPS history
	now := time.Now()
	m.history = append(m.history, tpsRecord{
		timestamp: now,
		tps:       tps,
		origin:    sample.Origin,
	})

	// Keep only last 60 seconds of data
	cutoff := now.Add(-60 * time.Second)
	for len(m.history) > 0 && m.history[0].timestamp.Before(cutoff) {
		m.history = m.history[1:]
	}

	// Calculate 1-minute average TPS
	if len(m.history) > 0 {
		var totalTPS float64
		for _, record := range m.history {
			totalTPS += record.tps
		}
		m.tps1m.Set(totalTPS / float64(len(m.history)))
	}

	// Update model ID if provided
	if sample.ModelID != "" {
		m.modelID = sample.ModelID
	}

	// Update hardware metrics if available
	if sample.PowerDraw > 0 {
		m.powerDraw.Set(sample.PowerDraw)
	}
	if sample.Temperature > 0 {
		m.temperature.Set(sample.Temperature)
	}
	if sample.MemoryUsage > 0 {
		m.memoryUsage.Set(sample.MemoryUsage)
	}
	if sample.GPUUtilization > 0 {
		m.gpuUtilization.Set(sample.GPUUtilization)
	}

	// Calculate cost and energy metrics
	m.updateCostEnergyMetrics(tps)

	// Update health status
	m.updateHealthStatus()

	// Track drift if we have both vendor and inference counts
	m.trackDrift(sample)

	m.lastUpdate = now
}

func (m *enhancedGpuMetrics) updateCostEnergyMetrics(currentTPS float64) {
	if currentTPS <= 0 {
		return
	}

	config, exists := gpuConfigs[m.gpuSKU]
	if !exists {
		config = gpuConfigs["A100"] // Default to A100 if SKU not found
	}

	// Cost per million tokens = (hourly_cost / (TPS * 3600)) * 1e6
	costPerMToken := (config.HourlyCost / (currentTPS * 3600)) * 1e6
	m.costPerMToken.Set(costPerMToken)

	// Energy per million tokens = (power_draw_W / TPS) * (1e6 / 3600 / 1000) [Wh]
	energyPerMToken := (config.PowerDrawW / currentTPS) * (1e6 / 3600 / 1000)
	m.energyPerMToken.Set(energyPerMToken)
}

func (m *enhancedGpuMetrics) updateHealthStatus() {
	config, exists := gpuConfigs[m.gpuSKU]
	if !exists {
		config = gpuConfigs["A100"]
	}

	// Check various health indicators
	healthScore := 2.0 // Start with healthy

	// Check temperature
	if temp := m.temperature; temp != nil {
		tempValue := getGaugeValue(temp)
		if tempValue > config.MaxTemp {
			healthScore = 0.0 // Critical
		} else if tempValue > config.MaxTemp*0.9 {
			healthScore = 1.0 // Warning
		}
	}

	// Check TPS efficiency
	currentTPS := getGaugeValue(m.tps)
	avgTPS := getGaugeValue(m.tps1m)
	if avgTPS > 0 {
		efficiency := currentTPS / avgTPS
		if efficiency < 0.8 {
			if healthScore > 0 {
				healthScore = 0.0 // Critical
			}
		} else if efficiency < 0.9 {
			if healthScore > 1 {
				healthScore = 1.0 // Warning
			}
		}
	}

	m.healthStatus.Set(healthScore)
}

func (m *enhancedGpuMetrics) trackDrift(sample TokenSample) {
	// Track vendor vs inference count drift
	if sample.Origin == "vendor" {
		m.lastVendorCount = sample.TokensProcessed
	} else if sample.Origin == "inference" {
		m.lastInfCount = sample.TokensProcessed
	}

	// Calculate drift if we have both counts
	if m.lastVendorCount > 0 && m.lastInfCount > 0 {
		diff := float64(m.lastVendorCount - m.lastInfCount)
		total := float64(m.lastVendorCount + m.lastInfCount)
		if total > 0 {
			driftPct := (diff / total) * 100
			if driftPct > 2.0 || driftPct < -2.0 {
				driftCounter.Inc()
				logger.Warn("Token count drift detected",
					zap.String("gpu_uuid", sample.GPUUUID),
					zap.Float64("drift_percent", driftPct),
					zap.Int64("vendor_count", m.lastVendorCount),
					zap.Int64("inference_count", m.lastInfCount),
				)
			}
			
			// Update reconciliation accuracy
			accuracy := 100.0 - math.Abs(driftPct)
			reconcileGauge.Set(accuracy)
		}
	}
}

func getGaugeValue(gauge prometheus.Gauge) float64 {
	// Helper function to safely extract gauge value
	dto := &dto.Metric{}
	if err := gauge.Write(dto); err != nil {
		return 0
	}
	return dto.GetGauge().GetValue()
}

// Enhanced sample loop with multiple input sources
func enhancedSampleLoop(r io.Reader, dcgmChan <-chan DCGMMetrics, grokChan <-chan TokenSample) {
	dec := json.NewDecoder(r)
	
	for {
		select {
		case dcgmMetric := <-dcgmChan:
			// Process DCGM metrics
			sample := TokenSample{
				GPUUUID:        dcgmMetric.GPUUUID,
				TokensProcessed: dcgmMetric.TokensTotal,
				WindowNS:       5000000000, // 5 second window
				Origin:         "vendor",
				PowerDraw:      dcgmMetric.PowerDraw,
				Temperature:    dcgmMetric.Temperature,
				MemoryUsage:    dcgmMetric.MemoryUsed,
				GPUUtilization: dcgmMetric.GPUUtilization,
				Timestamp:      dcgmMetric.Timestamp,
			}
			
			m := getEnhancedMetrics(sample.GPUUUID, "A100") // Default SKU
			m.updateMetrics(sample)
			
		case grokSample := <-grokChan:
			// Process Grok Cloud gRPC stream
			m := getEnhancedMetrics(grokSample.GPUUUID, "H100") // Grok typically uses H100
			m.updateMetrics(grokSample)
			
		default:
			// Process stdin JSON samples
			var ts TokenSample
			if err := dec.Decode(&ts); err != nil {
				if err == io.EOF {
					return
				}
				logger.Error("Decode error", zap.Error(err))
				continue
			}
			
			m := getEnhancedMetrics(ts.GPUUUID, "A100") // Default SKU
			m.updateMetrics(ts)
		}
	}
}

// Health check endpoint
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Unix(),
		"gpus_tracked": len(gpuMap),
	}
	json.NewEncoder(w).Encode(response)
}

// GPU-specific metrics endpoint  
func gpuMetricsHandler(w http.ResponseWriter, r *http.Request) {
	uuid := r.URL.Query().Get("uuid")
	if uuid == "" {
		http.Error(w, "uuid parameter required", http.StatusBadRequest)
		return
	}
	
	m, exists := gpuMap[uuid]
	if !exists {
		http.Error(w, "GPU not found", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"gpu_uuid":        uuid,
		"current_tps":     getGaugeValue(m.tps),
		"avg_tps_1m":      getGaugeValue(m.tps1m),
		"health_status":   getGaugeValue(m.healthStatus),
		"cost_per_mtoken": getGaugeValue(m.costPerMToken),
		"energy_per_mtoken": getGaugeValue(m.energyPerMToken),
		"last_updated":    m.lastUpdate.Unix(),
		"model_id":        m.modelID,
		"gpu_sku":         m.gpuSKU,
	}
	json.NewEncoder(w).Encode(response)
}

func main() {
	addr := flag.String("listen", ":8080", "listen address")
	enableDCGM := flag.Bool("dcgm", false, "enable DCGM integration")
	enableGrok := flag.Bool("grok", false, "enable Grok Cloud gRPC stream")
	flag.Parse()

	// Initialize channels for different data sources
	dcgmChan := make(chan DCGMMetrics, 100)
	grokChan := make(chan TokenSample, 100)

	// Start enhanced sample processing
	go enhancedSampleLoop(os.Stdin, dcgmChan, grokChan)

	// Set up HTTP endpoints
	http.Handle("/metrics", promhttp.HandlerFor(registry, promhttp.HandlerOpts{}))
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/gpu/metrics", gpuMetricsHandler)

	logger.Info("Starting enhanced GPU token exporter",
		zap.String("listen", *addr),
		zap.Bool("dcgm_enabled", *enableDCGM),
		zap.Bool("grok_enabled", *enableGrok),
	)

	log.Fatal(http.ListenAndServe(*addr, nil))
}
