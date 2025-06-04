
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Download } from "lucide-react";

interface CostAnalyticsProps {
  timeRange: string;
}

const CostAnalytics: React.FC<CostAnalyticsProps> = ({ timeRange }) => {
  const costTrendData = [
    { date: '2024-01-01', openai: 450, anthropic: 320, google: 280, meta: 150, total: 1200 },
    { date: '2024-01-02', openai: 520, anthropic: 380, google: 310, meta: 180, total: 1390 },
    { date: '2024-01-03', openai: 480, anthropic: 350, google: 290, meta: 160, total: 1280 },
    { date: '2024-01-04', openai: 610, anthropic: 420, google: 340, meta: 200, total: 1570 },
    { date: '2024-01-05', openai: 580, anthropic: 400, google: 320, meta: 190, total: 1490 },
    { date: '2024-01-06', openai: 650, anthropic: 450, google: 360, meta: 210, total: 1670 },
    { date: '2024-01-07', openai: 720, anthropic: 500, google: 390, meta: 230, total: 1840 },
  ];

  const costByModel = [
    { model: 'GPT-4 Turbo', cost: 1250, percentage: 35, change: 12 },
    { model: 'Claude-3 Opus', cost: 890, percentage: 25, change: -5 },
    { model: 'Gemini Pro', cost: 720, percentage: 20, change: 8 },
    { model: 'GPT-3.5 Turbo', cost: 460, percentage: 13, change: -15 },
    { model: 'LLaMA-2', cost: 230, percentage: 7, change: 22 },
  ];

  const costOptimizations = [
    { 
      title: 'Switch to GPT-3.5 for simple queries',
      potentialSavings: 680,
      effort: 'Low',
      impact: 'High'
    },
    {
      title: 'Implement prompt caching',
      potentialSavings: 420,
      effort: 'Medium',
      impact: 'Medium'
    },
    {
      title: 'Use Claude Haiku for draft generation',
      potentialSavings: 310,
      effort: 'Low',
      impact: 'Medium'
    },
    {
      title: 'Optimize token usage patterns',
      potentialSavings: 580,
      effort: 'High',
      impact: 'High'
    },
  ];

  const budgetAlerts = [
    { type: 'warning', message: 'Monthly budget 78% consumed with 8 days remaining', severity: 'medium' },
    { type: 'info', message: 'OpenAI costs increased 15% this week', severity: 'low' },
    { type: 'critical', message: 'Daily spending limit exceeded for GPT-4', severity: 'high' },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">$3,847</p>
                <p className="text-sm text-muted-foreground">Total This Month</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">$0.0034</p>
                <p className="text-sm text-muted-foreground">Avg Cost/Token</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">-8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">$890</p>
                <p className="text-sm text-muted-foreground">Potential Savings</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">23% reduction</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-sm text-muted-foreground">Budget Used</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm text-muted-foreground">$1,100 remaining</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Budget Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgetAlerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg flex items-center gap-3 ${
                alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20' :
                alert.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                'bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  alert.severity === 'high' ? 'bg-red-500' :
                  alert.severity === 'medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <span className="flex-1 text-sm">{alert.message}</span>
                <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trend Over Time */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cost Trends by Provider</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`$${value}`, '']}
                />
                <Legend />
                <Area type="monotone" dataKey="openai" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="anthropic" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="google" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="meta" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost by Model */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costByModel.map((model, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <p className="font-medium">{model.model}</p>
                      <p className="text-sm text-muted-foreground">{model.percentage}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${model.cost}</p>
                    <div className="flex items-center gap-1">
                      {model.change > 0 ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      )}
                      <span className={`text-sm ${model.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {Math.abs(model.change)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Optimization Recommendations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cost Optimization Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {costOptimizations.map((optimization, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{optimization.title}</h4>
                    <Badge variant={optimization.impact === 'High' ? 'default' : 'secondary'}>
                      {optimization.impact} Impact
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-medium">
                      ${optimization.potentialSavings} savings
                    </span>
                    <Badge variant="outline">{optimization.effort} effort</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CostAnalytics;
