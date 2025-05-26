
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Cpu, DollarSign, Search, RefreshCw } from 'lucide-react';
import GpuGrid from '@/components/gpu/GpuGrid';
import GpuSparklineCard from '@/components/gpu/GpuSparklineCard';
import GpuLeaderboard from '@/components/gpu/GpuLeaderboard';
import { generateMockGpuData, type GpuMetrics } from '@/lib/mockGpuData';

const GpuMonitoring = () => {
  const [gpuData, setGpuData] = useState<GpuMetrics[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('tps');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    const updateData = () => {
      setGpuData(generateMockGpuData(12));
    };

    updateData();
    const interval = setInterval(updateData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setGpuData(generateMockGpuData(12));
    setIsRefreshing(false);
  };

  const filteredData = gpuData.filter(gpu => 
    gpu.gpu_uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gpu.model_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTps = gpuData.reduce((sum, gpu) => sum + gpu.tps, 0);
  const totalCost = gpuData.reduce((sum, gpu) => sum + gpu.cost_per_hour, 0);
  const totalPower = gpuData.reduce((sum, gpu) => sum + gpu.power_draw_w, 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GPU Token Throughput Monitor</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring of GPU token processing performance</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total TPS</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Tokens per second across all GPUs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}/hr</div>
            <p className="text-xs text-muted-foreground">
              Current hourly operational cost
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Power</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPower.toFixed(0)}W</div>
            <p className="text-xs text-muted-foreground">
              Current power consumption
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by GPU UUID or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tps">TPS (Tokens/sec)</SelectItem>
            <SelectItem value="tokens_total">Total Tokens</SelectItem>
            <SelectItem value="cost_per_mtoken">Cost per M Tokens</SelectItem>
            <SelectItem value="power_draw_w">Power Draw</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">GPU Grid</TabsTrigger>
          <TabsTrigger value="sparklines">Sparklines</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="space-y-4">
          <GpuGrid data={filteredData} sortBy={sortBy} />
        </TabsContent>
        
        <TabsContent value="sparklines" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.slice(0, 6).map((gpu) => (
              <GpuSparklineCard key={gpu.gpu_uuid} gpu={gpu} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="leaderboard" className="space-y-4">
          <GpuLeaderboard data={gpuData} metric="tokens_total" limit={10} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GpuMonitoring;
