
export interface GpuMetrics {
  gpu_uuid: string;
  model_id: string;
  tps: number;
  tps_1m: number;
  tokens_total: number;
  tokens_prompt: number;
  tokens_generated: number;
  cost_per_mtoken: number;
  energy_per_mtoken: number;
  cost_per_hour: number;
  power_draw_w: number;
  utilization: number;
  status: 'healthy' | 'warning' | 'error';
  last_updated: Date;
  sparkline_data: number[];
}

const GPU_MODELS = [
  'NVIDIA A100 80GB',
  'NVIDIA H100 80GB',
  'NVIDIA V100 32GB',
  'NVIDIA RTX 4090',
  'NVIDIA A40',
  'NVIDIA RTX A6000'
];

const GPU_COSTS = {
  'NVIDIA A100 80GB': 3.20,
  'NVIDIA H100 80GB': 4.50,
  'NVIDIA V100 32GB': 2.40,
  'NVIDIA RTX 4090': 1.80,
  'NVIDIA A40': 2.20,
  'NVIDIA RTX A6000': 2.00
};

const GPU_POWER = {
  'NVIDIA A100 80GB': 400,
  'NVIDIA H100 80GB': 700,
  'NVIDIA V100 32GB': 300,
  'NVIDIA RTX 4090': 450,
  'NVIDIA A40': 300,
  'NVIDIA RTX A6000': 300
};

function generateSparklineData(): number[] {
  const data = [];
  let value = Math.random() * 1000 + 500;
  
  for (let i = 0; i < 60; i++) {
    value += (Math.random() - 0.5) * 100;
    value = Math.max(0, Math.min(2000, value));
    data.push(Math.round(value));
  }
  
  return data;
}

function generateGpuUuid(): string {
  return 'GPU-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

function getRandomStatus(): 'healthy' | 'warning' | 'error' {
  const rand = Math.random();
  if (rand < 0.8) return 'healthy';
  if (rand < 0.95) return 'warning';
  return 'error';
}

export function generateMockGpuData(count: number): GpuMetrics[] {
  const gpus: GpuMetrics[] = [];
  
  for (let i = 0; i < count; i++) {
    const model = GPU_MODELS[Math.floor(Math.random() * GPU_MODELS.length)];
    const baseTps = Math.random() * 800 + 200;
    const tps = Math.round(baseTps + (Math.random() - 0.5) * 100);
    const tps_1m = Math.round(baseTps);
    const sparklineData = generateSparklineData();
    const status = getRandomStatus();
    
    // Adjust TPS based on status
    const statusMultiplier = status === 'error' ? 0.3 : status === 'warning' ? 0.7 : 1;
    const adjustedTps = Math.round(tps * statusMultiplier);
    
    const tokens_prompt = Math.round(Math.random() * 1000000 + 500000);
    const tokens_generated = Math.round(Math.random() * 2000000 + 1000000);
    const tokens_total = tokens_prompt + tokens_generated;
    
    const cost_per_hour = GPU_COSTS[model as keyof typeof GPU_COSTS] || 2.0;
    const power_draw_w = GPU_POWER[model as keyof typeof GPU_POWER] || 300;
    
    // Calculate derived metrics
    const cost_per_mtoken = (cost_per_hour / (adjustedTps * 3.6)) * 1000; // Cost per 1M tokens
    const energy_per_mtoken = (power_draw_w / adjustedTps) * (1000000 / 3600 / 1000); // kWh per 1M tokens
    
    const utilization = Math.min(100, Math.round((adjustedTps / 1000) * 100 + Math.random() * 20));
    
    gpus.push({
      gpu_uuid: generateGpuUuid(),
      model_id: model,
      tps: adjustedTps,
      tps_1m,
      tokens_total,
      tokens_prompt,
      tokens_generated,
      cost_per_mtoken: Math.round(cost_per_mtoken * 100) / 100,
      energy_per_mtoken: Math.round(energy_per_mtoken * 1000) / 1000,
      cost_per_hour,
      power_draw_w,
      utilization,
      status,
      last_updated: new Date(),
      sparkline_data: sparklineData
    });
  }
  
  return gpus.sort((a, b) => b.tps - a.tps);
}
