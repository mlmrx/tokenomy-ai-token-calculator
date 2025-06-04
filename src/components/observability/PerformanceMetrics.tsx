
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, Zap, TrendingUp, TrendingDown, Cpu, Activity } from "lucide-react";

interface PerformanceMetricsProps {
  timeRange: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ timeRange }) => {
  const latencyData = [
    { time: '00:00', p50: 850, p95: 1200, p99: 1800 },
    { time: '04:00', p50: 920, p95: 1350, p99: 1950 },
    { time: '08:00', p50: 780, p95: 1100, p99: 1650 },
    { time: '12:00', p50: 1050, p95: 1450, p99: 2100 },
    { time: '16:00', p50: 890, p95: 1250, p99: 1850 },
    { time: '20:00', p50: 750, p95: 1050, p99: 1550 },
  ];

  const throughputData = [
    { time: '00:00', tokens: 8500, requests: 45, efficiency: 85 },
    { time: '04:00', tokens: 6200, requests: 32, efficiency: 78 },
    { time: '08:00', tokens: 12800, requests: 68, efficiency: 92 },
    { time: '12:00', tokens: 15200, requests: 82, efficiency: 88 },
    { time: '16:00', tokens: 13900, requests: 74, efficiency: 91 },
    { time: '20:00', tokens: 9800, requests: 52, efficiency: 87 },
  ];

  const providerPerformance = [
    { 
      provider: 'OpenAI', 
      avgLatency: 1250, 
      throughput: 12500, 
      errorRate: 0.02, 
      availability: 99.9,
      trend: 'up' 
    },
    { 
      provider: 'Anthropic', 
      avgLatency: 1100, 
      throughput: 9800, 
      errorRate: 0.01, 
      availability: 99.8,
      trend: 'up' 
    },
    { 
      provider: 'Google', 
      avgLatency: 980, 
      throughput: 11200, 
      errorRate: 0.03, 
      availability: 99.7,
      trend: 'down' 
    },
    { 
      provider: 'Meta', 
      avgLatency: 1420, 
      throughput: 7600, 
      errorRate: 0.04, 
      availability: 99.5,
      trend: 'up' 
    },
  ];

  const performanceAlerts = [
    { 
      type: 'latency', 
      message: 'High latency detected on OpenAI GPT-4', 
      severity: 'warning',
      timestamp: '2 min ago'
    },
    { 
      type: 'throughput', 
      message: 'Throughput below threshold for Google Gemini', 
      severity: 'critical',
      timestamp: '5 min ago'
    },
    { 
      type: 'error', 
      message: 'Error rate spike in Meta LLaMA requests', 
      severity: 'warning',
      timestamp: '8 min ago'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">892ms</p>
                <p className="text-sm text-muted-foreground">Avg Latency (p50)</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">-12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">11.2K</p>
                <p className="text-sm text-muted-foreground">Tokens/sec</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">99.8%</p>
                <p className="text-sm text-muted-foreground">Availability</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+0.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Cpu className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">0.021%</p>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">-15%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceAlerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg flex items-center justify-between ${
                alert.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20' :
                'bg-yellow-50 dark:bg-yellow-900/20'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm">{alert.message}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Latency Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}ms`, '']} />
                <Legend />
                <Line type="monotone" dataKey="p50" stroke="#10B981" strokeWidth={2} name="p50" />
                <Line type="monotone" dataKey="p95" stroke="#3B82F6" strokeWidth={2} name="p95" />
                <Line type="monotone" dataKey="p99" stroke="#EF4444" strokeWidth={2} name="p99" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Throughput Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Throughput & Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="tokens" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Tokens/sec" />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={3} name="Efficiency %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Provider Performance Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Provider Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providerPerformance.map((provider, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{provider.provider}</h4>
                      {provider.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <Badge variant={provider.availability >= 99.8 ? 'default' : 'secondary'}>
                      {provider.availability}% uptime
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Avg Latency</p>
                      <p className="font-medium">{provider.avgLatency}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Throughput</p>
                      <p className="font-medium">{provider.throughput.toLocaleString()}/s</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Error Rate</p>
                      <p className="font-medium">{provider.errorRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
