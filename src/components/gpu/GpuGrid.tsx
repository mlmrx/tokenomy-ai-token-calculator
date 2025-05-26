
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Activity, DollarSign, Leaf } from 'lucide-react';
import { GpuMetrics } from '@/lib/mockGpuData';

interface GpuGridProps {
  data: GpuMetrics[];
  sortBy: string;
}

const GpuGrid: React.FC<GpuGridProps> = ({ data, sortBy }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy as keyof GpuMetrics] as number;
    const bValue = b[sortBy as keyof GpuMetrics] as number;
    return bValue - aValue;
  });

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No GPU data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          GPU Performance Grid
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>GPU UUID</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">TPS</TableHead>
                <TableHead className="text-right">1m Avg</TableHead>
                <TableHead className="text-right">Total Tokens</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
                <TableHead className="text-right">Cost/M</TableHead>
                <TableHead className="text-right">Energy/M</TableHead>
                <TableHead className="text-right">Power</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((gpu) => (
                <TableRow key={gpu.gpu_uuid} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(gpu.status)}`} />
                      <Badge className={getStatusBadge(gpu.status)}>
                        {gpu.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{gpu.gpu_uuid}</TableCell>
                  <TableCell className="font-medium">{gpu.model_id}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Zap className="h-3 w-3 text-blue-500" />
                      <span className="font-mono">{gpu.tps.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{gpu.tps_1m.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{(gpu.tokens_total / 1000000).toFixed(1)}M</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${gpu.utilization}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{gpu.utilization}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      <span className="font-mono">${gpu.cost_per_mtoken.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Leaf className="h-3 w-3 text-green-600" />
                      <span className="font-mono">{gpu.energy_per_mtoken.toFixed(3)} kWh</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{gpu.power_draw_w}W</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default GpuGrid;
