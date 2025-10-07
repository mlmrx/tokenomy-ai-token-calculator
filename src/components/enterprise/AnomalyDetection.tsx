import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export const AnomalyDetection = () => {
  const anomalies = [
    { type: "cost_spike", severity: "high", metric: "Cost per 1k TU", baseline: 2.1, observed: 5.7, zScore: 4.2, time: "2 hours ago" },
    { type: "latency_spike", severity: "medium", metric: "P95 Latency", baseline: 142, observed: 487, zScore: 3.1, time: "5 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Anomaly Detection</h2>
        <p className="text-muted-foreground">Automated detection with z-score analysis</p>
      </div>

      <div className="space-y-4">
        {anomalies.map((anomaly, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {anomaly.metric}
                </CardTitle>
                <Badge variant={anomaly.severity === "high" ? "destructive" : "default"}>
                  {anomaly.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Baseline</p>
                  <p className="text-xl font-bold">{anomaly.baseline}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Observed</p>
                  <p className="text-xl font-bold text-red-500">{anomaly.observed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Z-Score</p>
                  <p className="text-xl font-bold">{anomaly.zScore}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Detected</p>
                  <p className="text-xl font-bold">{anomaly.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
