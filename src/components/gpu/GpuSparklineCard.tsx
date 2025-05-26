
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  ChartOptions
} from 'chart.js';
import { Zap, Activity, DollarSign } from 'lucide-react';
import { GpuMetrics } from '@/lib/mockGpuData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

interface GpuSparklineCardProps {
  gpu: GpuMetrics;
}

const GpuSparklineCard: React.FC<GpuSparklineCardProps> = ({ gpu }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const chartData = {
    labels: gpu.sparkline_data.map((_, index) => `${index}s`),
    datasets: [
      {
        data: gpu.sparkline_data,
        borderColor: gpu.status === 'healthy' ? '#22c55e' : 
                    gpu.status === 'warning' ? '#eab308' : '#ef4444',
        backgroundColor: gpu.status === 'healthy' ? '#22c55e20' : 
                        gpu.status === 'warning' ? '#eab30820' : '#ef444420',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        fill: true,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: () => '',
          label: (context) => `${context.parsed.y} TPS`,
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 4,
      },
    },
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium truncate">
            {gpu.gpu_uuid}
          </CardTitle>
          <Badge className={getStatusColor(gpu.status)}>
            {gpu.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{gpu.model_id}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sparkline Chart */}
        <div className="h-20">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-blue-500" />
            <span className="text-muted-foreground">TPS:</span>
            <span className="font-mono font-medium">{gpu.tps.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-purple-500" />
            <span className="text-muted-foreground">Util:</span>
            <span className="font-mono font-medium">{gpu.utilization}%</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-green-500" />
            <span className="text-muted-foreground">Cost/M:</span>
            <span className="font-mono font-medium">${gpu.cost_per_mtoken.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Power:</span>
            <span className="font-mono font-medium">{gpu.power_draw_w}W</span>
          </div>
        </div>

        {/* Total Tokens */}
        <div className="pt-2 border-t">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Total Tokens:</span>
            <span className="font-mono font-medium">{(gpu.tokens_total / 1000000).toFixed(1)}M</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GpuSparklineCard;
