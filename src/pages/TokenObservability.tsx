
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Activity, TrendingUp, AlertTriangle, Download, Share2, Settings, Zap, DollarSign, Leaf, Clock, Database, Globe } from "lucide-react";
import ObservabilityDashboard from "@/components/observability/ObservabilityDashboard";
import RealTimeMonitor from "@/components/observability/RealTimeMonitor";
import CostAnalytics from "@/components/observability/CostAnalytics";
import PerformanceMetrics from "@/components/observability/PerformanceMetrics";
import AlertsPanel from "@/components/observability/AlertsPanel";
import TokenFlowVisualizer from "@/components/observability/TokenFlowVisualizer";
import DataImportPanel from "@/components/observability/DataImportPanel";
import IntegrationsManager from "@/components/observability/IntegrationsManager";
import EnhancedMetrics from "@/components/observability/EnhancedMetrics";
import GlassmorphicTheme from "@/components/GlassmorphicTheme";

const TokenObservability = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [isRealTime, setIsRealTime] = useState(true);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleDataImported = (data: any[]) => {
    setImportedData(data);
    // Automatically switch to dashboard after importing data
    setActiveTab('dashboard');
  };

  const exportData = () => {
    const exportData = {
      timeRange,
      timestamp: new Date().toISOString(),
      metrics: {
        totalCost: 2847,
        totalTokens: 156420,
        activeProviders: 12,
        efficiencyScore: 92
      },
      providers: ['OpenAI', 'Anthropic', 'Google', 'Azure'],
      data: importedData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-observability-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <GlassmorphicTheme variant="hero" className="p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Token Observability Platform
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Comprehensive monitoring, analytics, and optimization for AI token usage across all platforms
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
              
              <Button variant="outline" size="sm" onClick={exportData}>
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
        </GlassmorphicTheme>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassmorphicTheme variant="card">
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
          </GlassmorphicTheme>

          <GlassmorphicTheme variant="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Integrations</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </GlassmorphicTheme>

          <GlassmorphicTheme variant="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cost Today</p>
                  <p className="text-2xl font-bold">$2,847</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </GlassmorphicTheme>

          <GlassmorphicTheme variant="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Efficiency Score</p>
                  <p className="text-2xl font-bold">94.2%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </GlassmorphicTheme>
        </div>

        {/* Main Content */}
        <GlassmorphicTheme variant="card" className="rounded-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 p-6">
            <TabsList className="grid w-full grid-cols-9 glassmorphic-tabs bg-gradient-to-r from-slate-800/50 to-indigo-800/50 backdrop-blur-lg border border-white/10">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:backdrop-blur-md data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/10">
                <Activity className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:backdrop-blur-md data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/10">
                <Database className="h-4 w-4" />
                Data Import
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:backdrop-blur-md data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/10">
                <Globe className="h-4 w-4" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="realtime" className="flex items-center gap-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:backdrop-blur-md data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/10">
                <Eye className="h-4 w-4" />
                Real-time
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:backdrop-blur-md data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/10">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center gap-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:backdrop-blur-md data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/10">
                <DollarSign className="h-4 w-4" />
                Cost Analytics
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:backdrop-blur-md data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/10">
                <Clock className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:backdrop-blur-md data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/10">
                <AlertTriangle className="h-4 w-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="flow" className="flex items-center gap-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:backdrop-blur-md data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/10">
                <Zap className="h-4 w-4" />
                Token Flow
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <ObservabilityDashboard timeRange={timeRange} selectedProvider={selectedProvider} />
            </TabsContent>

            <TabsContent value="import">
              <DataImportPanel onDataImported={handleDataImported} />
            </TabsContent>

            <TabsContent value="integrations">
              <IntegrationsManager />
            </TabsContent>

            <TabsContent value="realtime">
              <RealTimeMonitor isActive={isRealTime} />
            </TabsContent>

            <TabsContent value="analytics">
              <EnhancedMetrics timeRange={timeRange} data={importedData} />
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
        </GlassmorphicTheme>
      </div>
      <style jsx global>{`
        .glassmorphic-tabs {
          --tab-highlight: rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          overflow: hidden;
          backdrop-filter: blur(12px);
        }
        .glassmorphic-tabs [data-state=active] {
          position: relative;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default TokenObservability;
