
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Activity, TrendingUp, AlertTriangle, Download, Share2, Settings, Zap, DollarSign, Leaf, Clock } from "lucide-react";
import ObservabilityDashboard from "@/components/observability/ObservabilityDashboard";
import RealTimeMonitor from "@/components/observability/RealTimeMonitor";
import CostAnalytics from "@/components/observability/CostAnalytics";
import PerformanceMetrics from "@/components/observability/PerformanceMetrics";
import AlertsPanel from "@/components/observability/AlertsPanel";
import TokenFlowVisualizer from "@/components/observability/TokenFlowVisualizer";

const TokenObservability = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [isRealTime, setIsRealTime] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Token Observability
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Real-time monitoring and analytics for AI token usage across all providers
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="6h">6 Hours</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Operational</span>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Providers</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cost Today</p>
                  <p className="text-2xl font-bold">$2,847</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Efficiency Score</p>
                  <p className="text-2xl font-bold">92%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Real-time
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Analytics
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Token Flow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ObservabilityDashboard timeRange={timeRange} selectedProvider={selectedProvider} />
          </TabsContent>

          <TabsContent value="realtime">
            <RealTimeMonitor isActive={isRealTime} />
          </TabsContent>

          <TabsContent value="costs">
            <CostAnalytics timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMetrics timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsPanel />
          </TabsContent>

          <TabsContent value="flow">
            <TokenFlowVisualizer timeRange={timeRange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TokenObservability;
