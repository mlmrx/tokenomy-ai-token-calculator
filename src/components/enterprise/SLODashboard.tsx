import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown } from "lucide-react";

export const SLODashboard = () => {
  const slos = [
    { name: "Claims Extraction", p95Target: 300, p95Actual: 142, successTarget: 0.995, successActual: 0.998, budgetTarget: 3.5, budgetActual: 2.1, conforming: true },
    { name: "Coding Assistant", p95Target: 500, p95Actual: 287, successTarget: 0.99, successActual: 0.996, budgetTarget: 5.0, budgetActual: 3.8, conforming: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">SLO Dashboard</h2>
        <p className="text-muted-foreground">Phase 2: Advanced observability with SLO tracking</p>
      </div>

      <div className="grid gap-4">
        {slos.map((slo) => (
          <Card key={slo.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {slo.name}
                </CardTitle>
                <Badge variant={slo.conforming ? "default" : "destructive"}>
                  {slo.conforming ? "Conforming" : "Non-conforming"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">P95 Latency</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{slo.p95Actual}ms</span>
                    {slo.p95Actual < slo.p95Target ? (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Target: {slo.p95Target}ms</p>
                  <Progress value={(slo.p95Actual / slo.p95Target) * 100} className="mt-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{(slo.successActual * 100).toFixed(2)}%</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Target: {(slo.successTarget * 100).toFixed(2)}%</p>
                  <Progress value={(slo.successActual / slo.successTarget) * 100} className="mt-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Cost per 1M Tokens</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">${slo.budgetActual}</span>
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Target: ${slo.budgetTarget}</p>
                  <Progress value={(slo.budgetActual / slo.budgetTarget) * 100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
