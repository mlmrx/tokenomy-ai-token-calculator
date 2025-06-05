
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GpuSparklineCard } from './GpuSparklineCard';
import { GpuLeaderboard } from './GpuLeaderboard';
import { Search, Filter, RefreshCw, Grid, List, AlertTriangle } from 'lucide-react';

interface GpuInfo {
  gpu_uuid: string;
  current_tps: number;
  avg_tps_1m: number;
  tokens_total: number;
  health_status: 'healthy' | 'warning' | 'critical';
  cost_per_mtoken: number;
  energy_per_mtoken: number;
  gpu_utilization: number;
  memory_usage: number;
  temperature: number;
  power_draw: number;
  model_id?: string;
  last_updated: number;
}

type SortField = 'current_tps' | 'avg_tps_1m' | 'tokens_total' | 'cost_per_mtoken' | 'energy_per_mtoken' | 'gpu_utilization';
type ViewMode = 'grid' | 'table';

export function GpuGrid() {
  const [data, setData] = useState<GpuInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('current_tps');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [healthFilter, setHealthFilter] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In production, this would fetch from /gpu/leaderboard?metric=detailed&limit=100
        const mockData: GpuInfo[] = [];
        
        for (let i = 0; i < 24; i++) {
          const basePerformance = 1500 + Math.random() * 1000;
          const healthStatuses: ('healthy' | 'warning' | 'critical')[] = ['healthy', 'healthy', 'healthy', 'warning', 'critical'];
          const health = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
          
          // Performance degrades with health issues
          const healthMultiplier = health === 'healthy' ? 1 : health === 'warning' ? 0.8 : 0.5;
          const currentTps = Math.round(basePerformance * healthMultiplier * (0.9 + Math.random() * 0.2));
          
          mockData.push({
            gpu_uuid: `gpu-${String(i + 1).padStart(3, '0')}-${Math.random().toString(36).substr(2, 8)}`,
            current_tps: currentTps,
            avg_tps_1m: Math.round(currentTps * (0.95 + Math.random() * 0.1)),
            tokens_total: Math.floor(Math.random() * 50000000) + 10000000,
            health_status: health,
            cost_per_mtoken: parseFloat((2.5 + Math.random() * 3).toFixed(2)),
            energy_per_mtoken: parseFloat((150 + Math.random() * 100).toFixed(2)),
            gpu_utilization: Math.round(60 + Math.random() * 40),
            memory_usage: Math.round(40 + Math.random() * 50),
            temperature: Math.round(65 + Math.random() * 20),
            power_draw: Math.round(250 + Math.random() * 100),
            model_id: ['llama-7b', 'gpt-3.5', 'claude-2', 'mistral-7b'][Math.floor(Math.random() * 4)],
            last_updated: Date.now() - Math.random() * 300000 // Within last 5 minutes
          });
        }
        
        setData(mockData);
      } catch (error) {
        console.error('Failed to fetch GPU data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
      setLastRefresh(Date.now());
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(gpu => {
      const matchesSearch = gpu.gpu_uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (gpu.model_id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesHealth = healthFilter === 'all' || gpu.health_status === healthFilter;
      return matchesSearch && matchesHealth;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      return (aValue - bValue) * multiplier;
    });

    return filtered;
  }, [data, searchTerm, healthFilter, sortField, sortDirection]);

  const healthCounts = useMemo(() => {
    return data.reduce((acc, gpu) => {
      acc[gpu.health_status] = (acc[gpu.health_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [data]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatValue = (value: number, field: SortField) => {
    switch (field) {
      case 'tokens_total':
        return `${(value / 1e6).toFixed(1)}M`;
      case 'cost_per_mtoken':
        return `$${value.toFixed(2)}`;
      case 'energy_per_mtoken':
        return `${value.toFixed(1)}Wh`;
      case 'gpu_utilization':
        return `${value}%`;
      default:
        return value.toString();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading GPU data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-muted-foreground">Total GPUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{healthCounts.healthy || 0}</div>
            <p className="text-xs text-muted-foreground">Healthy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{healthCounts.warning || 0}</div>
            <p className="text-xs text-muted-foreground">Warning</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{healthCounts.critical || 0}</div>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              GPU Token Throughput Monitor
              <Badge variant="outline" className="text-xs">
                Last updated: {new Date(lastRefresh).toLocaleTimeString()}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search GPUs or models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={healthFilter} onValueChange={(value: any) => setHealthFilter(value)}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_tps">Current TPS</SelectItem>
                <SelectItem value="avg_tps_1m">1-Min Avg TPS</SelectItem>
                <SelectItem value="tokens_total">Total Tokens</SelectItem>
                <SelectItem value="cost_per_mtoken">Cost/Million</SelectItem>
                <SelectItem value="energy_per_mtoken">Energy/Million</SelectItem>
                <SelectItem value="gpu_utilization">GPU Utilization</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedData.map((gpu) => (
            <GpuSparklineCard
              key={gpu.gpu_uuid}
              gpu_uuid={gpu.gpu_uuid}
              current_tps={gpu.current_tps}
              avg_tps_1m={gpu.avg_tps_1m}
              tokens_total={gpu.tokens_total}
              health_status={gpu.health_status}
              cost_per_mtoken={gpu.cost_per_mtoken}
              energy_per_mtoken={gpu.energy_per_mtoken}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">GPU UUID</th>
                    <th className="text-left p-4 font-medium cursor-pointer hover:bg-muted" 
                        onClick={() => handleSort('current_tps')}>
                      Current TPS {sortField === 'current_tps' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-4 font-medium cursor-pointer hover:bg-muted"
                        onClick={() => handleSort('avg_tps_1m')}>
                      1m Avg {sortField === 'avg_tps_1m' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-4 font-medium cursor-pointer hover:bg-muted"
                        onClick={() => handleSort('tokens_total')}>
                      Total Tokens {sortField === 'tokens_total' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium cursor-pointer hover:bg-muted"
                        onClick={() => handleSort('cost_per_mtoken')}>
                      Cost/MT {sortField === 'cost_per_mtoken' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-4 font-medium cursor-pointer hover:bg-muted"
                        onClick={() => handleSort('energy_per_mtoken')}>
                      Energy/MT {sortField === 'energy_per_mtoken' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-4 font-medium">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedData.map((gpu) => (
                    <tr key={gpu.gpu_uuid} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-mono text-sm">{gpu.gpu_uuid.substring(0, 16)}...</div>
                        {gpu.model_id && (
                          <div className="text-xs text-muted-foreground">{gpu.model_id}</div>
                        )}
                      </td>
                      <td className="p-4 font-bold">{gpu.current_tps}</td>
                      <td className="p-4">{gpu.avg_tps_1m}</td>
                      <td className="p-4">{formatValue(gpu.tokens_total, 'tokens_total')}</td>
                      <td className="p-4">
                        <Badge variant={getHealthBadgeVariant(gpu.health_status)}>
                          {gpu.health_status}
                        </Badge>
                      </td>
                      <td className="p-4">${gpu.cost_per_mtoken.toFixed(2)}</td>
                      <td className="p-4">{gpu.energy_per_mtoken.toFixed(1)}Wh</td>
                      <td className="p-4">{gpu.gpu_utilization}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <GpuLeaderboard metric="tokens_total" limit={10} />

      {filteredAndSortedData.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No GPUs found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
