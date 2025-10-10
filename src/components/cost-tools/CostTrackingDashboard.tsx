import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Bell, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

// Mock data - in real app, this would come from actual usage tracking
const generateMockData = () => {
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cost: 50 + Math.random() * 100,
      requests: 5000 + Math.random() * 5000,
      tokens: 1000000 + Math.random() * 2000000
    };
  });
  return days;
};

const CostTrackingDashboard: React.FC = () => {
  const [monthlyBudget, setMonthlyBudget] = useState(2000);
  const [alertThreshold, setAlertThreshold] = useState(80); // percentage

  const historicalData = generateMockData();
  const currentMonthSpend = historicalData.reduce((sum, day) => sum + day.cost, 0);
  const projectedMonthlySpend = (currentMonthSpend / historicalData.length) * 30;
  const budgetUsed = (currentMonthSpend / monthlyBudget) * 100;
  const isOverBudget = budgetUsed > 100;
  const isNearThreshold = budgetUsed >= alertThreshold && budgetUsed < 100;

  const avgDailyCost = currentMonthSpend / historicalData.length;
  const totalRequests = historicalData.reduce((sum, day) => sum + day.requests, 0);
  const totalTokens = historicalData.reduce((sum, day) => sum + day.tokens, 0);

  const providerBreakdown = [
    { provider: "OpenAI", spend: currentMonthSpend * 0.4, percentage: 40 },
    { provider: "Anthropic", spend: currentMonthSpend * 0.35, percentage: 35 },
    { provider: "Google", spend: currentMonthSpend * 0.15, percentage: 15 },
    { provider: "Cohere", spend: currentMonthSpend * 0.1, percentage: 10 }
  ];

  const modelBreakdown = [
    { model: "GPT-4", spend: currentMonthSpend * 0.25, requests: totalRequests * 0.15 },
    { model: "Claude Sonnet", spend: currentMonthSpend * 0.30, requests: totalRequests * 0.25 },
    { model: "GPT-3.5", spend: currentMonthSpend * 0.20, requests: totalRequests * 0.35 },
    { model: "Gemini Flash", spend: currentMonthSpend * 0.15, requests: totalRequests * 0.20 },
    { model: "Claude Haiku", spend: currentMonthSpend * 0.10, requests: totalRequests * 0.05 }
  ];

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {isOverBudget && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You've exceeded your monthly budget by ${(currentMonthSpend - monthlyBudget).toFixed(2)}!
            Consider optimizing usage or increasing your budget.
          </AlertDescription>
        </Alert>
      )}

      {isNearThreshold && !isOverBudget && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            You've used {budgetUsed.toFixed(1)}% of your monthly budget. 
            Projected to spend ${projectedMonthlySpend.toFixed(0)} this month.
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Management
          </CardTitle>
          <CardDescription>Set your spending limits and alert thresholds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Monthly Budget ($)</Label>
              <Input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Alert Threshold (%)</Label>
              <Input
                type="number"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                min={1}
                max={100}
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Used: ${currentMonthSpend.toFixed(2)} / ${monthlyBudget}</span>
              <span className={budgetUsed > 100 ? "text-red-600 font-semibold" : ""}>
                {budgetUsed.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(budgetUsed, 100)} 
              className={budgetUsed > 100 ? "bg-red-100 dark:bg-red-950" : ""}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 text-sm">
            <div>
              <div className="text-muted-foreground">Remaining</div>
              <div className="text-lg font-semibold">
                ${Math.max(0, monthlyBudget - currentMonthSpend).toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Projected</div>
              <div className="text-lg font-semibold">
                ${projectedMonthlySpend.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Days Left</div>
              <div className="text-lg font-semibold">{30 - historicalData.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Current Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentMonthSpend.toFixed(0)}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>vs ${(currentMonthSpend * 0.9).toFixed(0)} last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Daily Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgDailyCost.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {totalRequests.toLocaleString()} requests
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalTokens / 1_000_000).toFixed(1)}M</div>
            <div className="text-sm text-muted-foreground mt-1">
              ${(currentMonthSpend / (totalTokens / 1_000_000)).toFixed(2)}/M tokens
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Cost per Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(currentMonthSpend / totalRequests).toFixed(4)}
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingDown className="h-3 w-3" />
              <span>-8% vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Spending Trend (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="hsl(var(--primary))" 
                name="Daily Cost ($)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Provider Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spend by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providerBreakdown.map(provider => (
                <div key={provider.provider}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{provider.provider}</span>
                    <span>${provider.spend.toFixed(2)} ({provider.percentage}%)</span>
                  </div>
                  <Progress value={provider.percentage} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spend by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={modelBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="spend" fill="hsl(var(--primary))" name="Spend ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization Recommendations</CardTitle>
          <CardDescription>Based on your current usage patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-600">High Impact</Badge>
                <span className="font-semibold">Switch Simple Tasks to Cheaper Models</span>
              </div>
              <p className="text-sm text-muted-foreground">
                ~35% of your requests could use GPT-3.5 or Claude Haiku instead of premium models. 
                Potential savings: ${(currentMonthSpend * 0.35 * 0.7).toFixed(0)}/month
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-600">Medium Impact</Badge>
                <span className="font-semibold">Implement Batch Processing</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Many of your requests could be batched together. 
                Potential savings: ${(currentMonthSpend * 0.15).toFixed(0)}/month
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Low Impact</Badge>
                <span className="font-semibold">Optimize Prompt Length</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Reduce input tokens by removing redundant context. 
                Potential savings: ${(currentMonthSpend * 0.08).toFixed(0)}/month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostTrackingDashboard;
