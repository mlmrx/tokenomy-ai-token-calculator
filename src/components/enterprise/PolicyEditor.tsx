import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Route, Play } from "lucide-react";

export const PolicyEditor = () => {
  const samplePolicy = `version: 1
id: pol_lowlat_costcap
scope: workflow:claims_extract_v3
objectives: 
  p95_latency_ms: 300
  success_rate: 0.995
  budget_cpm_usd: 3.50
priority: latency_then_cost
routes:
  - id: groq_fast
    provider: groq
    model: llama-4-70b
    region: us-central
    min_health: 0.97
  - id: openai_hedge
    provider: openai
    model: o4-mini
fallbacks: [openai_hedge]`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Routing Policy Editor</h2>
          <p className="text-muted-foreground">Phase 4: Policy engine & intelligent routing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Play className="w-4 h-4 mr-2" />
            Dry Run
          </Button>
          <Button>Save Policy</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            Declarative Policy Language (RPL)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={samplePolicy}
            className="font-mono text-sm h-[400px]"
            placeholder="Enter your routing policy..."
          />
        </CardContent>
      </Card>
    </div>
  );
};
