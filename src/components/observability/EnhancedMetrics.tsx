
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Zap, Clock, Users, Globe, Target, Cpu, Activity } from "lucide-react";

interface EnhancedMetricsProps {
  timeRange: string;
  data?: any[];
}

const EnhancedMetrics: React.FC<EnhancedMetricsProps> = ({ timeRange, data = [] }) => {
  const [selectedMetric, setSelectedMetric] = useState('cost');

  // Mock comprehensive data
  const costOptimizationData = [
    { provider: 'OpenAI', current: 2847, optimized: 2290, savings: 557 },
    { provider: 'Google', current: 1932, optimized: 1544, savings: 388 },
    { provider: 'Anthropic', current: 1456, optimized: 1310, savings: 146 },
    { provider: 'Azure', current: 1123, optimized: 1012, savings: 111 },
  ];

  const efficiencyMetrics = [
    { time: '00:00', tokensPerSecond: 12400, responseTime: 1.2, efficiency: 92 },
    { time: '04:00', tokensPerSecond: 9800, responseTime: 1.5, efficiency: 89 },
    { time: '08:00', tokensPerSecond: 15600, responseTime: 1.1, efficiency: 94 },
    { time: '12:00', tokensPerSecond: 18200, responseTime: 0.9, efficiency: 96 },
    { time: '16:00', tokensPerSecond: 16800, responseTime: 1.0, efficiency: 95 },
    { time: '20:00', tokensPerSecond: 13200, responseTime: 1.3, efficiency: 91 },
  ];

  const userPatternData = [
    { hour: '0-2', users: 145, tokens: 12300, avgSession: 4.2 },
    { hour: '2-4', users: 98, tokens: 8900, avgSession: 3.8 },
    { hour: '4-6', users: 87, tokens: 7600, avgSession: 3.5 },
    { hour: '6-8', users: 234, tokens: 21400, avgSession: 5.1 },
    { hour: '8-10', users: 456, tokens: 42300, avgSession: 6.2 },
    { hour: '10-12', users: 598, tokens: 54200, avgSession: 7.1 },
    { hour: '12-14', users: 634, tokens: 58900, avgSession: 7.8 },
    { hour: '14-16', users: 567, tokens: 52100, avgSession: 7.2 },
    { hour: '16-18', users: 489, tokens: 43800, avgSession: 6.5 },
    { hour: '18-20', users: 398, tokens: 35600, avgSession: 5.9 },
    { hour: '20-22', users: 312, tokens: 28100, avgSession: 5.2 },
    { hour: '22-24', users: 198, tokens: 17800, avgSession: 4.6 },
  ];

  const modelPerformanceData = [
    { model: 'GPT-4', avgLatency: 1.2, throughput: 8500, cost: 0.03, quality: 95 },
    { model: 'GPT-3.5-Turbo', avgLatency: 0.8, throughput: 12000, cost: 0.002, quality: 88 },
    { model: 'Claude-3', avgLatency: 1.5, throughput: 7200, cost: 0.025, quality: 93 },
    { model: 'Gemini Pro', avgLatency: 1.1, throughput: 9200, cost: 0.02, quality: 90 },
    { model: 'Azure GPT-4', avgLatency: 1.3, throughput: 8100, cost: 0.032, quality: 94 },
  ];

  const geographicData = [
    { region: 'North America', tokens: 45, cost: 1250, latency: 120 },
    { region: 'Europe', tokens: 32, cost: 890, latency: 95 },
    { region: 'Asia Pacific', tokens: 28, cost: 780, latency: 180 },
    { region: 'South America', tokens: 8, cost: 220, latency: 240 },
    { region: 'Africa', tokens: 3, cost: 85, latency: 320 },
  ];

  const alertTrendsData = [
    { date: '2024-01-01', cost: 3, latency: 1, error: 0, throughput: 2 },
    { date: '2024-01-02', cost: 5, latency: 2, error: 1, throughput: 1 },
    { date: '2024-01-03', cost: 2, latency: 0, error: 0, throughput: 3 },
    { date: '2024-01-04', cost: 7, latency: 3, error: 2, throughput: 0 },
    { date: '2024-01-05', cost: 4, latency: 1, error: 1, throughput: 2 },
    { date: '2024-01-06', cost: 1, latency: 0, error: 0, throughput: 1 },
    { date: '2024-01-07', cost: 6, latency: 2, error: 1, throughput: 4 },
  ];

  const kpiMetrics = [
    { title: 'Total Cost Savings', value: '$1,202', change: 12.5, trend: 'up', icon: DollarSign, color: 'text-green-600' },
    { title: 'Avg Response Time', value: '1.1s', change: -8.2, trend: 'down', icon: Clock, color: 'text-blue-600' },
    { title: 'Token Efficiency', value: '94.2%', change: 3.1, trend: 'up', icon: Target, color: 'text-purple-600' },
    { title: 'Active Users', value: '4,892', change: 15.7, trend: 'up', icon: Users, color: 'text-orange-600' },
    { title: 'Error Rate', value: '0.08%', change: -42.1, trend: 'down', icon: Activity, color: 'text-red-600' },
    { title: 'Throughput', value: '14.2K/s', change: 6.8, trend: 'up', icon: Zap, color: 'text-indigo-600' },
  ];

  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm text-green-600">{Math.abs(metric.change)}%</span>
                  </div>
                </div>
                <div className={`p-2 bg-gray-100 dark:bg-gray-800 rounded-full ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Analytics Tabs */}
      <Tabs defaultValue="efficiency" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="patterns">User Patterns</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="alerts">Alert Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="efficiency">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Efficiency Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={efficiencyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={3} name="Efficiency %" />
                    <Line yAxisId="right" type="monotone" dataKey="responseTime" stroke="#3B82F6" strokeWidth={2} name="Response Time (s)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Throughput Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={efficiencyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="tokensPerSecond" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costOptimizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="provider" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="current" fill="#EF4444" name="Current Cost" />
                    <Bar dataKey="optimized" fill="#10B981" name="Optimized Cost" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {costOptimizationData.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="text-center space-y-2">
                        <h4 className="font-medium">{item.provider}</h4>
                        <div className="text-2xl font-bold text-green-600">${item.savings}</div>
                        <p className="text-sm text-muted-foreground">potential savings</p>
                        <Badge variant="outline">
                          {((item.savings / item.current) * 100).toFixed(1)}% reduction
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={userPatternData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="users" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Active Users" />
                  <Area yAxisId="right" type="monotone" dataKey="tokens" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Token Usage" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={modelPerformanceData}>
                  <CartesianGrid />
                  <XAxis dataKey="avgLatency" name="Latency (s)" />
                  <YAxis dataKey="cost" name="Cost per 1K tokens" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Models" dataKey="cost" fill="#8B5CF6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Region</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={geographicData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="tokens"
                    >
                      {geographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geographicData.map((region, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{region.region}</h4>
                        <p className="text-sm text-muted-foreground">{region.tokens}% of total usage</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${region.cost}</p>
                        <p className="text-sm text-muted-foreground">{region.latency}ms avg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alert Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={alertTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="cost" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Cost Alerts" />
                  <Area type="monotone" dataKey="latency" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Latency Alerts" />
                  <Area type="monotone" dataKey="error" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Error Alerts" />
                  <Area type="monotone" dataKey="throughput" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Throughput Alerts" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedMetrics;
