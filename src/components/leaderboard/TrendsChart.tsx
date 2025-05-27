
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendData {
  date: string;
  openai: number;
  google: number;
  anthropic: number;
  meta: number;
}

interface TrendsChartProps {
  metric: 'tokens' | 'tps' | 'cost' | 'efficiency';
  timeRange: '7d' | '30d' | '90d';
}

const TrendsChart: React.FC<TrendsChartProps> = ({ metric, timeRange }) => {
  // Generate mock historical data based on current metrics
  const generateTrendData = (): TrendData[] => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data: TrendData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Base values with realistic variations
      const baseValues = {
        tokens: { openai: 2.5, google: 3.2, anthropic: 0.8, meta: 1.5 }, // Trillions
        tps: { openai: 8500, google: 12000, anthropic: 4200, meta: 7800 },
        cost: { openai: 5.50, google: 4.20, anthropic: 8.75, meta: 3.20 },
        efficiency: { openai: 12.5, google: 10.8, anthropic: 15.2, meta: 8.9 }
      };
      
      const values = baseValues[metric];
      const variation = 0.1; // 10% variation
      
      data.push({
        date: date.toISOString().split('T')[0],
        openai: values.openai * (1 + (Math.random() - 0.5) * variation),
        google: values.google * (1 + (Math.random() - 0.5) * variation),
        anthropic: values.anthropic * (1 + (Math.random() - 0.5) * variation),
        meta: values.meta * (1 + (Math.random() - 0.5) * variation),
      });
    }
    
    return data;
  };

  const data = generateTrendData();
  
  const formatValue = (value: number) => {
    if (metric === 'tokens') return `${value.toFixed(1)}T`;
    if (metric === 'tps') return `${Math.round(value)}`;
    if (metric === 'cost') return `$${value.toFixed(2)}`;
    if (metric === 'efficiency') return `${value.toFixed(1)} kWh`;
    return value.toString();
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'tokens': return 'Monthly Tokens (Trillions)';
      case 'tps': return 'Tokens Per Second';
      case 'cost': return 'Cost per 1M Tokens ($)';
      case 'efficiency': return 'Energy per 1M Tokens (kWh)';
      default: return '';
    }
  };

  const getTrendDirection = (vendor: keyof Omit<TrendData, 'date'>) => {
    if (data.length < 2) return 'neutral';
    const latest = data[data.length - 1][vendor];
    const previous = data[data.length - 2][vendor];
    const change = ((latest - previous) / previous) * 100;
    
    if (Math.abs(change) < 1) return 'neutral';
    return change > 0 ? 'up' : 'down';
  };

  const vendorColors = {
    openai: '#10B981',
    google: '#3B82F6', 
    anthropic: '#8B5CF6',
    meta: '#F59E0B'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{getMetricLabel()}</CardTitle>
          <div className="flex gap-2">
            {Object.keys(vendorColors).map((vendor) => {
              const direction = getTrendDirection(vendor as keyof Omit<TrendData, 'date'>);
              const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;
              
              return (
                <Badge key={vendor} variant="outline" className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: vendorColors[vendor as keyof typeof vendorColors] }}
                  />
                  {vendor}
                  <Icon className={`h-3 w-3 ${
                    direction === 'up' ? 'text-green-500' : 
                    direction === 'down' ? 'text-red-500' : 
                    'text-gray-500'
                  }`} />
                </Badge>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [formatValue(value), '']}
            />
            <Legend />
            {Object.entries(vendorColors).map(([vendor, color]) => (
              <Line
                key={vendor}
                type="monotone"
                dataKey={vendor}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                name={vendor.charAt(0).toUpperCase() + vendor.slice(1)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TrendsChart;
