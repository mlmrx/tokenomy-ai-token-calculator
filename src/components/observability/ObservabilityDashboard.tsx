
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap, DollarSign, Clock, Cpu } from "lucide-react";

interface ObservabilityDashboardProps {
  timeRange: string;
  selectedProvider: string;
}

const ObservabilityDashboard: React.FC<ObservabilityDashboardProps> = ({ timeRange, selectedProvider }) => {
  // Mock data - in production, this would come from your observability backend
  const tokenUsageData = [
    { time: '00:00', openai: 2400, anthropic: 1800, google: 2200, meta: 1600 },
    { time: '04:00', openai: 1800, anthropic: 1400, google: 1900, meta: 1200 },
    { time: '08:00', openai: 3200, anthropic: 2600, google: 2800, meta: 2200 },
    { time: '12:00', openai: 4100, anthropic: 3200, google: 3600, meta: 2800 },
    { time: '16:00', openai: 3800, anthropic: 3000, google: 3300, meta: 2600 },
    { time: '20:00', openai: 2900, anthropic: 2300, google: 2600, meta: 2000 },
  ];

  const costTrendData = [
    { time: '00:00', cost: 120, tokens: 8000 },
    { time: '04:00', cost: 95, tokens: 6300 },
    { time: '08:00', cost: 185, tokens: 10800 },
    { time: '12:00', cost: 245, tokens: 13700 },
    { time: '16:00', cost: 225, tokens: 12700 },
    { time: '20:00', cost: 175, tokens: 9800 },
  ];

  const providerDistribution = [
    { name: 'OpenAI', value: 35, color: '#10B981' },
    { name: 'Anthropic', value: 25, color: '#8B5CF6' },
    { name: 'Google', value: 28, color: '#3B82F6' },
    { name: 'Meta', value: 12, color: '#F59E0B' },
  ];

  const performanceMetrics = [
    { metric: 'Avg Response Time', value: '1.2s', change: -8, trend: 'down' },
    { metric: 'Token Throughput', value: '12.5K/s', change: 15, trend: 'up' },
    { metric: 'Error Rate', value: '0.02%', change: -25, trend: 'down' },
    { metric: 'Cost Efficiency', value: '$3.20/1M', change: -12, trend: 'down' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.metric}</p>
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
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  {index === 0 && <Clock className="h-6 w-6 text-blue-600" />}
                  {index === 1 && <Zap className="h-6 w-6 text-blue-600" />}
                  {index === 2 && <Cpu className="h-6 w-6 text-blue-600" />}
                  {index === 3 && <DollarSign className="h-6 w-6 text-blue-600" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Token Usage by Provider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tokenUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="openai" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="anthropic" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="google" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="meta" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost vs Token Correlation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost vs Token Correlation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="cost" fill="#10B981" name="Cost ($)" />
                <Line yAxisId="right" type="monotone" dataKey="tokens" stroke="#3B82F6" strokeWidth={3} name="Tokens (K)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Provider Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Provider Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={providerDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {providerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">High cost spike detected</p>
                  <p className="text-xs text-muted-foreground">OpenAI usage increased 45% in last hour</p>
                </div>
                <Badge variant="secondary">Warning</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New provider added</p>
                  <p className="text-xs text-muted-foreground">Google Gemini integration is now active</p>
                </div>
                <Badge variant="secondary">Info</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Efficiency improved</p>
                  <p className="text-xs text-muted-foreground">Token per query ratio decreased by 8%</p>
                </div>
                <Badge variant="secondary">Success</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ObservabilityDashboard;
