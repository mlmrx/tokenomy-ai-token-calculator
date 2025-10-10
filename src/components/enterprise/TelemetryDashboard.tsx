import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, DollarSign, AlertTriangle, Download, Filter } from "lucide-react";

const tokenFlowData = [
  { time: '00:00', gpt4: 1200, claude: 800, gemini: 600, llama: 400 },
  { time: '04:00', gpt4: 900, claude: 700, gemini: 500, llama: 350 },
  { time: '08:00', gpt4: 2100, claude: 1500, gemini: 1200, llama: 800 },
  { time: '12:00', gpt4: 3200, claude: 2100, gemini: 1800, llama: 1200 },
  { time: '16:00', gpt4: 2800, claude: 1900, gemini: 1500, llama: 1000 },
  { time: '20:00', gpt4: 1800, claude: 1200, gemini: 900, llama: 600 },
];

const costAttributionData = [
  { name: 'Product Team', value: 35, cost: '$12,450' },
  { name: 'Customer Support', value: 28, cost: '$9,980' },
  { name: 'Marketing', value: 18, cost: '$6,420' },
  { name: 'Engineering', value: 12, cost: '$4,280' },
  { name: 'Sales', value: 7, cost: '$2,490' },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const MetricCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-bold mb-2">{value}</h3>
        <div className="flex items-center gap-2">
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  </Card>
);

export const TelemetryDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Advanced Telemetry Dashboard</h2>
          <p className="text-muted-foreground">Real-time insights into token usage, costs, and performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filter</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Tokens (24h)" value="24.3M" change="+12.5%" icon={Activity} trend="up" />
        <MetricCard title="Total Cost (24h)" value="$35,620" change="+8.2%" icon={DollarSign} trend="up" />
        <MetricCard title="Avg Latency" value="234ms" change="-15.3%" icon={Zap} trend="down" />
        <MetricCard title="Error Rate" value="0.12%" change="-42.1%" icon={AlertTriangle} trend="down" />
      </div>

      <Tabs defaultValue="flow">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flow">Token Flow</TabsTrigger>
          <TabsTrigger value="attribution">Cost Attribution</TabsTrigger>
          <TabsTrigger value="forecast">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="flow" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Real-Time Token Flow</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={tokenFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="gpt4" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="GPT-4" />
                <Area type="monotone" dataKey="claude" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Claude 3" />
                <Area type="monotone" dataKey="gemini" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Gemini Pro" />
                <Area type="monotone" dataKey="llama" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Llama 3" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="attribution">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cost Attribution by Team</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={costAttributionData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {costAttributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">30-Day Cost Forecast</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                <p className="text-sm mb-1">Forecasted Cost</p>
                <p className="text-3xl font-bold text-blue-600">$1.2M</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
                <p className="text-sm mb-1">Potential Savings</p>
                <p className="text-3xl font-bold text-green-600">$186K</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950">
                <p className="text-sm mb-1">Confidence</p>
                <p className="text-3xl font-bold text-amber-600">94%</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
