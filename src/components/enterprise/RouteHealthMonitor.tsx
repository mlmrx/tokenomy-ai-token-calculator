import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

export const RouteHealthMonitor = () => {
  const routes = [
    { id: "groq_fast", provider: "Groq", model: "llama-4-70b", health: 0.98, p95: 87, successRate: 0.998, healthy: true },
    { id: "openai_hedge", provider: "OpenAI", model: "o4-mini", health: 0.96, p95: 142, successRate: 0.997, healthy: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Route Health Monitor</h2>
        <p className="text-muted-foreground">Real-time health tracking for routing decisions</p>
      </div>

      <div className="grid gap-4">
        {routes.map((route) => (
          <Card key={route.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {route.provider} - {route.model}
                </CardTitle>
                <Badge variant={route.healthy ? "default" : "destructive"}>
                  {route.healthy ? "Healthy" : "Degraded"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Health Score</p>
                  <div className="text-2xl font-bold">{(route.health * 100).toFixed(1)}%</div>
                  <Progress value={route.health * 100} className="mt-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">P95 Latency</p>
                  <div className="text-2xl font-bold">{route.p95}ms</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
                  <div className="text-2xl font-bold">{(route.successRate * 100).toFixed(2)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
