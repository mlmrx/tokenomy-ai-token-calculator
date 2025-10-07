import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, DollarSign, Clock, Zap, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const TelemetryDashboard = () => {
  const [timeRange, setTimeRange] = useState("1h");
  const [telemetryData, setTelemetryData] = useState<any[]>([]);
  const [costData, setCostData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTelemetryData();
  }, [timeRange]);

  const loadTelemetryData = async () => {
    try {
      setLoading(true);

      // Calculate time window
      const hours = timeRange.includes("h") ? parseInt(timeRange) : parseInt(timeRange) * 24;
      const fromTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      // Fetch telemetry events
      const { data, error } = await supabase
        .from("telemetry_events")
        .select("*")
        .gte("ts", fromTime)
        .order("ts", { ascending: true });

      if (error) throw error;

      // Aggregate data for charts
      const hourlyData: Record<string, any> = {};

      data?.forEach((event) => {
        const hour = new Date(event.ts).toISOString().slice(0, 13) + ":00";

        if (!hourlyData[hour]) {
          hourlyData[hour] = {
            time: hour,
            requests: 0,
            totalCost: 0,
            totalTokens: 0,
            avgLatency: 0,
            latencySum: 0,
            providers: {} as Record<string, number>,
          };
        }

        hourlyData[hour].requests += 1;
        hourlyData[hour].totalCost += event.total_cost_usd || 0;
        hourlyData[hour].totalTokens += event.input_tokens + event.output_tokens;
        hourlyData[hour].latencySum += event.duration_ms;
        hourlyData[hour].avgLatency = hourlyData[hour].latencySum / hourlyData[hour].requests;

        const provider = event.provider;
        hourlyData[hour].providers[provider] = (hourlyData[hour].providers[provider] || 0) + 1;
      });

      const chartData = Object.values(hourlyData).map((d: any) => ({
        time: new Date(d.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        requests: d.requests,
        cost: parseFloat(d.totalCost.toFixed(4)),
        tokens: d.totalTokens,
        latency: Math.round(d.avgLatency),
        groq: d.providers.groq || 0,
        openai: d.providers.openai || 0,
        anthropic: d.providers.anthropic || 0,
      }));

      setTelemetryData(chartData);

      // Calculate cost breakdown by provider
      const providerCosts: Record<string, number> = {};
      data?.forEach((event) => {
        const provider = event.provider;
        providerCosts[provider] = (providerCosts[provider] || 0) + (event.total_cost_usd || 0);
      });

      setCostData(
        Object.entries(providerCosts).map(([provider, cost]) => ({
          provider: provider.charAt(0).toUpperCase() + provider.slice(1),
          cost: parseFloat(cost.toFixed(2)),
        }))
      );

      setLoading(false);
    } catch (error: any) {
      console.error("Error loading telemetry:", error);
      toast.error("Failed to load telemetry data");
      setLoading(false);
    }
  };

  // Mock KPIs (would be calculated from real data)
  const kpis = {
    totalRequests: telemetryData.reduce((sum, d) => sum + d.requests, 0),
    totalCost: telemetryData.reduce((sum, d) => sum + d.cost, 0),
    avgLatency: telemetryData.reduce((sum, d) => sum + d.latency, 0) / (telemetryData.length || 1),
    totalTokens: telemetryData.reduce((sum, d) => sum + d.tokens, 0),
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-time Telemetry</h2>
          <p className="text-muted-foreground">Phase 1: Core telemetry & cost tracking</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="6h">Last 6 Hours</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalRequests.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12.3% vs previous</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.totalCost.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
              <TrendingDown className="w-3 h-3" />
              <span>-8.7% vs previous</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(kpis.avgLatency)}ms</div>
            <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
              <TrendingDown className="w-3 h-3" />
              <span>-15.2% vs previous</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(kpis.totalTokens / 1000).toFixed(1)}k</div>
            <div className="flex items-center gap-1 text-xs text-blue-500 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+5.4% vs previous</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Request Volume & Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={telemetryData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="requests"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                  name="Requests"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="latency"
                  stroke="hsl(var(--destructive))"
                  fillOpacity={0.3}
                  fill="hsl(var(--destructive))"
                  name="Latency (ms)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={telemetryData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorCost)"
                  name="Cost ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Provider Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="groq" stackId="a" fill="#3b82f6" name="Groq" />
                <Bar dataKey="openai" stackId="a" fill="#8b5cf6" name="OpenAI" />
                <Bar dataKey="anthropic" stackId="a" fill="#ec4899" name="Anthropic" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost by Provider */}
        <Card>
          <CardHeader>
            <CardTitle>Cost by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="provider" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="hsl(var(--primary))" name="Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                  Warning
                </Badge>
                <div>
                  <p className="font-medium">Claims Extraction Workflow</p>
                  <p className="text-sm text-muted-foreground">Budget at 84% ($421 of $500)</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500/30">
                  OK
                </Badge>
                <div>
                  <p className="font-medium">Coding Assistant Agent</p>
                  <p className="text-sm text-muted-foreground">Budget at 42% ($126 of $300)</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
