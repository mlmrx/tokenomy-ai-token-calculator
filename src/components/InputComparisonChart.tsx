
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { History, LineChart } from "lucide-react";
import { analysisChartColors } from "@/lib/modelThemes";

interface InputComparisonProps {
  recentInputs: Array<{
    id: string;
    timestamp: string;
    text: string;
    tokens: number;
    chars: number;
    model: string;
    costs: {
      input: number;
      output: number;
      total: number;
    }
  }>;
  onSelectInput?: (inputId: string) => void;
}

const InputComparisonChart: React.FC<InputComparisonProps> = ({ recentInputs = [], onSelectInput }) => {
  // No data placeholder
  if (!recentInputs.length) {
    recentInputs = [
      {
        id: "placeholder-1",
        timestamp: new Date().toISOString(),
        text: "Your first analysis will appear here",
        tokens: 0,
        chars: 0,
        model: "gpt-4",
        costs: { input: 0, output: 0, total: 0 }
      },
      {
        id: "placeholder-2",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        text: "Compare with previous inputs",
        tokens: 0,
        chars: 0,
        model: "gpt-4",
        costs: { input: 0, output: 0, total: 0 }
      }
    ];
  }
  
  // Prepare data for chart
  const chartData = recentInputs.map((input, index) => ({
    name: `Input ${index + 1}`,
    tokens: input.tokens,
    chars: input.chars,
    cost: parseFloat((input.costs.total * 1000).toFixed(2)) // Convert to millicents for visualization
  }));

  // Format timestamps for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Compare Recent Inputs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[240px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke={analysisChartColors.tokens.border} />
              <YAxis yAxisId="right" orientation="right" stroke={analysisChartColors.outputCost.border} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === "cost") return [`$${(parseFloat(value as string) / 1000).toFixed(6)}`, "Estimated Cost"];
                  return [value, name.charAt(0).toUpperCase() + name.slice(1)];
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="tokens" name="Tokens" fill={analysisChartColors.tokens.bg} />
              <Bar yAxisId="left" dataKey="chars" name="Characters" fill={analysisChartColors.chars.bg} />
              <Bar yAxisId="right" dataKey="cost" name="Cost (millicents)" fill={analysisChartColors.outputCost.bg} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Recent Analyses</h4>
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
            {recentInputs.map((input, index) => (
              <div 
                key={input.id}
                className="p-2 border rounded-md flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onSelectInput && onSelectInput(input.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 bg-primary/10 rounded text-primary font-medium">
                      {input.model}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(input.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm truncate mt-1 text-foreground">
                    {input.text?.substring(0, 50) || "No text"}
                    {input.text?.length > 50 ? "..." : ""}
                  </p>
                </div>
                <div className="text-right ml-2">
                  <div className="text-sm font-medium">{input.tokens.toLocaleString()} tokens</div>
                  <div className="text-xs text-muted-foreground">${input.costs.total.toFixed(6)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InputComparisonChart;
