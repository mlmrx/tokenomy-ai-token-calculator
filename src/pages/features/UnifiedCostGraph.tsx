import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, TrendingUp, AlertTriangle, DollarSign, Zap, Download, Settings } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GlassmorphicTheme from "@/components/GlassmorphicTheme";

const UnifiedCostGraph = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedHierarchy, setSelectedHierarchy] = useState('workflow');

  // Mock real-time telemetry data
  const telemetryData = [
    { time: '00:00', cost: 45, latency: 142, tokens: 15420, provider: 'groq' },
    { time: '04:00', cost: 52, latency: 156, tokens: 18340, provider: 'openai' },
    { time: '08:00', cost: 89, latency: 134, tokens: 28940, provider: 'groq' },
    { time: '12:00', cost: 124, latency: 148, tokens: 42100, provider: 'anthropic' },
    { time: '16:00', cost: 156, latency: 128, tokens: 54200, provider: 'groq' },
    { time: '20:00', cost: 98, latency: 145, tokens: 38900, provider: 'openai' },
  ];

  // Attribution hierarchy data
  const attributionData = [
    { name: 'Claims Copilot', cost: 847, tokens: 156420, calls: 3421, workflow: 'fn_extract_icd10_v3' },
    { name: 'Medical Coding', cost: 623, tokens: 124800, calls: 2890, workflow: 'fn_diagnosis_mapper' },
    { name: 'Document Parser', cost: 412, tokens: 98200, calls: 1845, workflow: 'fn_parse_medical_doc' },
    { name: 'Compliance Check', cost: 289, tokens: 72400, calls: 1234, workflow: 'fn_hipaa_validator' },
  ];

  // Provider distribution
  const providerData = [
    { name: 'Groq LPU', value: 1247, color: '#10b981' },
    { name: 'OpenAI', value: 856, color: '#3b82f6' },
    { name: 'Anthropic', value: 623, color: '#8b5cf6' },
    { name: 'vLLM', value: 445, color: '#f59e0b' },
  ];

  // SLO conformance data
  const sloData = [
    { metric: 'p50 Latency', target: 150, actual: 128, status: 'ok' },
    { metric: 'p95 Latency', target: 300, actual: 276, status: 'ok' },
    { metric: 'p99 Latency', target: 500, actual: 412, status: 'ok' },
    { metric: 'Success Rate', target: 99.5, actual: 99.8, status: 'ok' },
    { metric: 'Cost/1K TU', target: 3.5, actual: 2.8, status: 'ok' },
  ];

  // Anomaly alerts
  const alerts = [
    { id: 1, type: 'cost', severity: 'warning', message: 'Cost spike detected in Claims Copilot (+34%)', time: '2h ago' },
    { id: 2, type: 'latency', severity: 'info', message: 'p95 latency trending up for OpenAI routes', time: '4h ago' },
    { id: 3, type: 'budget', severity: 'critical', message: 'Daily budget threshold exceeded (95% of cap)', time: '6h ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <GlassmorphicTheme variant="hero" className="p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Unified Cost Graph
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Real-time cost + latency observability across all providers
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
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </GlassmorphicTheme>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassmorphicTheme variant="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost (24h)</p>
                  <p className="text-2xl font-bold">$2,847</p>
                  <p className="text-xs text-green-500">↓ 12% vs yesterday</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </GlassmorphicTheme>

          <GlassmorphicTheme variant="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Latency (p95)</p>
                  <p className="text-2xl font-bold">276ms</p>
                  <p className="text-xs text-green-500">↓ 8% improvement</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </GlassmorphicTheme>

          <GlassmorphicTheme variant="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tokens</p>
                  <p className="text-2xl font-bold">451.8K</p>
                  <p className="text-xs text-blue-500">↑ 18% growth</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </GlassmorphicTheme>

          <GlassmorphicTheme variant="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">SLO Conformance</p>
                  <p className="text-2xl font-bold">99.8%</p>
                  <p className="text-xs text-green-500">Target: 99.5%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </GlassmorphicTheme>
        </div>

        {/* Main Content */}
        <GlassmorphicTheme variant="card" className="rounded-2xl">
          <Tabs defaultValue="telemetry" className="p-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
              <TabsTrigger value="attribution">Attribution</TabsTrigger>
              <TabsTrigger value="slo">SLO Tracking</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
              <TabsTrigger value="providers">Providers</TabsTrigger>
            </TabsList>

            <TabsContent value="telemetry" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Cost & Latency Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={telemetryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="cost" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Cost ($)" />
                      <Area yAxisId="right" type="monotone" dataKey="latency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Latency (ms)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Token Throughput by Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={telemetryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tokens" fill="#8b5cf6" name="Tokens (K)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attribution" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Attribution Hierarchy</CardTitle>
                    <Select value={selectedHierarchy} onValueChange={setSelectedHierarchy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="app">Application</SelectItem>
                        <SelectItem value="workflow">Workflow</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="session">Session</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attributionData.map((item, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.workflow}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${item.cost}</p>
                            <p className="text-xs text-muted-foreground">{item.calls} calls</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-muted-foreground">Tokens: {item.tokens.toLocaleString()}</span>
                          <span className="text-muted-foreground">$/1K TU: ${(item.cost / (item.tokens / 1000)).toFixed(3)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="slo" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>SLO Conformance Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sloData.map((slo, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{slo.metric}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Target: {slo.target}</span>
                            <span className="font-bold">{slo.actual}</span>
                            <span className={`text-xs px-2 py-1 rounded ${slo.status === 'ok' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {slo.status === 'ok' ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${slo.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min((slo.actual / slo.target) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="anomalies" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Detection & Budget Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'critical' ? 'border-red-500 bg-red-500/10' :
                        alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-500/10' :
                        'border-blue-500 bg-blue-500/10'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                              alert.severity === 'critical' ? 'text-red-500' :
                              alert.severity === 'warning' ? 'text-yellow-500' :
                              'text-blue-500'
                            }`} />
                            <div>
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-sm text-muted-foreground mt-1">{alert.type} • {alert.time}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Investigate</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="providers" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Provider Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={providerData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: $${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {providerData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Provider Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {providerData.map((provider, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{provider.name}</span>
                            <span className="text-sm">${provider.value}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${(provider.value / providerData.reduce((sum, p) => sum + p.value, 0)) * 100}%`,
                                backgroundColor: provider.color
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </GlassmorphicTheme>
      </div>
    </div>
  );
};

export default UnifiedCostGraph;
