
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SparklineData {
  timestamp: number;
  tps: number;
  tokens_total: number;
  cost_per_mtoken: number;
  energy_per_mtoken: number;
}

interface GpuSparklineCardProps {
  gpu_uuid: string;
  current_tps: number;
  avg_tps_1m: number;
  tokens_total: number;
  health_status: 'healthy' | 'warning' | 'critical';
  cost_per_mtoken: number;
  energy_per_mtoken: number;
}

export function GpuSparklineCard({ 
  gpu_uuid, 
  current_tps, 
  avg_tps_1m, 
  tokens_total,
  health_status,
  cost_per_mtoken,
  energy_per_mtoken
}: GpuSparklineCardProps) {
  const [sparklineData, setSparklineData] = useState<SparklineData[]>([]);

  useEffect(() => {
    // Simulate fetching 60-second sparkline data
    const fetchSparklineData = async () => {
      // In production, this would fetch from /gpu/{uuid}/tps?range=1m&granularity=1s
      const mockData: SparklineData[] = [];
      const now = Date.now();
      
      for (let i = 59; i >= 0; i--) {
        const variance = 0.1 * (Math.random() - 0.5);
        mockData.push({
          timestamp: now - i * 1000,
          tps: Math.round(current_tps * (1 + variance)),
          tokens_total: tokens_total - (i * current_tps),
          cost_per_mtoken: cost_per_mtoken * (1 + variance * 0.5),
          energy_per_mtoken: energy_per_mtoken * (1 + variance * 0.3)
        });
      }
      
      setSparklineData(mockData);
    };

    fetchSparklineData();
    const interval = setInterval(fetchSparklineData, 5000); // Update every 5s

    return () => clearInterval(interval);
  }, [gpu_uuid, current_tps, tokens_total, cost_per_mtoken, energy_per_mtoken]);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const chartData = {
    labels: sparklineData.map((_, i) => i),
    datasets: [
      {
        label: 'TPS',
        data: sparklineData.map(d => d.tps),
        borderColor: health_status === 'healthy' ? '#22c55e' : 
                    health_status === 'warning' ? '#eab308' : '#ef4444',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    interaction: {
      intersect: false,
    },
  };

  return (
    <Card className="h-48">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {gpu_uuid.substring(0, 8)}...
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getHealthColor(health_status)}`} />
            <Badge variant={getHealthBadgeVariant(health_status)} className="text-xs">
              {health_status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">{current_tps}</span>
            <span className="text-xs text-muted-foreground">TPS</span>
          </div>
          
          <div className="h-16 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">1m Avg:</span>
              <span className="ml-1 font-medium">{avg_tps_1m}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total:</span>
              <span className="ml-1 font-medium">{(tokens_total / 1e6).toFixed(1)}M</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cost/MT:</span>
              <span className="ml-1 font-medium">${cost_per_mtoken.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Energy/MT:</span>
              <span className="ml-1 font-medium">{energy_per_mtoken.toFixed(2)}Wh</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
