
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GpuGrid } from "../../gpu-monitor/ui/GpuGrid";
import { GpuLeaderboard } from "../../gpu-monitor/ui/GpuLeaderboard";
import Footer from "@/components/Footer";
import { AlertTriangle, Activity, Zap, DollarSign, Leaf, RefreshCw } from "lucide-react";

interface SystemAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: number;
  gpu_uuid?: string;
}

const GpuMonitoring = () => {
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Simulate system alerts
    const generateAlerts = () => {
      const alerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          message: 'GPU-003 performance degraded by 15% - investigating thermal throttling',
          timestamp: Date.now() - 300000,
          gpu_uuid: 'gpu-003-abc123'
        },
        {
          id: '2',
          type: 'critical',
          message: 'GPU-017 offline - requires immediate attention',
          timestamp: Date.now() - 120000,
          gpu_uuid: 'gpu-017-def456'
        },
        {
          id: '3',
          type: 'info',
          message: 'Scheduled maintenance window: GPU cluster maintenance on Sunday 2:00 AM UTC',
          timestamp: Date.now() - 3600000
        }
      ];
      setSystemAlerts(alerts);
    };

    generateAlerts();
    const interval = setInterval(generateAlerts, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string): "default" | "destructive" => {
    switch (type) {
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">GPU Token Throughput Monitor</h1>
            <p className="text-muted-foreground">
              Real-time monitoring of GPU performance, token throughput, and cost efficiency
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Alerts */}
        {systemAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </h2>
            {systemAlerts.slice(0, 3).map((alert) => (
              <Alert key={alert.id} variant={getAlertVariant(alert.type)} className="border-l-4">
                <AlertDescription className="flex items-start gap-2">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                      {alert.gpu_uuid && (
                        <span className="ml-2 font-mono">{alert.gpu_uuid}</span>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Avg TPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-green-600">+5.2% from last hour</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">847.2M</div>
              <p className="text-xs text-blue-600">+12.3M tokens/hour</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Avg Cost/MT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$3.42</div>
              <p className="text-xs text-red-600">+$0.15 from last hour</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Energy/MT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">185Wh</div>
              <p className="text-xs text-green-600">-8Wh from last hour</p>
            </CardContent>
          </Card>
        </div>

        {/* Main GPU Grid */}
        <GpuGrid />

        {/* Performance Insights */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Optimization Opportunities</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <span>3 GPUs running below 80% efficiency - consider workload rebalancing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span>Memory usage optimization could improve TPS by ~12%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Power management settings optimized for cost efficiency</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Cluster Health</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Healthy GPUs</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">18/24</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Performance Warnings</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">5/24</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Critical Issues</span>
                      <Badge variant="destructive">1/24</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cluster Efficiency</span>
                      <span className="text-sm font-medium">87.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GpuMonitoring;
