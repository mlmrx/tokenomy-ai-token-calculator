import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GitBranch, Settings, Activity, TrendingUp, AlertCircle, CheckCircle, XCircle, Play } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GlassmorphicTheme from "@/components/GlassmorphicTheme";

const PolicyBudgetRouting = () => {
  const [selectedPolicy, setSelectedPolicy] = useState('pol_claims_lowlat_v1');
  const [simulationRunning, setSimulationRunning] = useState(false);

  // Mock policy data
  const policies = [
    {
      id: 'pol_claims_lowlat_v1',
      name: 'Claims Copilot - Low Latency',
      workflow: 'fn_extract_icd10_v3',
      objective: 'latency_then_cost',
      slo: { p95_latency_ms: 300, success_rate: 0.995, budget_cpm_usd: 3.50 },
      status: 'active',
      routes: ['groq_fast', 'openai_hedge']
    },
    {
      id: 'pol_batch_cost_opt',
      name: 'Batch Processing - Cost Optimized',
      workflow: 'fn_batch_analysis',
      objective: 'cost_then_latency',
      slo: { p95_latency_ms: 2000, success_rate: 0.99, budget_cpm_usd: 1.20 },
      status: 'active',
      routes: ['groq_standard', 'vllm_fallback']
    }
  ];

  // Route health data
  const routeHealth = [
    { name: 'Groq LPU', health: 98.7, tps: 2450, latency_p95: 142, cost_per_1k: 0.85, region: 'us-central' },
    { name: 'OpenAI o4-mini', health: 99.2, tps: 1800, latency_p95: 186, cost_per_1k: 1.45, region: 'us-west' },
    { name: 'Anthropic Claude', health: 97.3, tps: 1200, latency_p95: 234, cost_per_1k: 2.10, region: 'us-east' },
    { name: 'vLLM Self-hosted', health: 96.1, tps: 3200, latency_p95: 168, cost_per_1k: 0.42, region: 'on-prem' }
  ];

  // Routing decisions over time
  const routingData = [
    { time: '00:00', groq: 145, openai: 42, anthropic: 18, vllm: 8 },
    { time: '04:00', groq: 178, openai: 38, anthropic: 15, vllm: 12 },
    { time: '08:00', groq: 234, openai: 56, anthropic: 28, vllm: 15 },
    { time: '12:00', groq: 289, openai: 67, anthropic: 34, vllm: 22 },
    { time: '16:00', groq: 312, openai: 45, anthropic: 29, vllm: 18 },
    { time: '20:00', groq: 267, openai: 52, anthropic: 31, vllm: 20 }
  ];

  // Multi-objective scoring
  const scoringFactors = [
    { factor: 'SLO Feasibility', weight: 0.6, current: 0.94 },
    { factor: 'Cost Savings', weight: 0.3, current: 0.87 },
    { factor: 'Quality Proxy', weight: 0.1, current: 0.91 }
  ];

  // Sample RPL policy
  const sampleRPL = `version: 1
id: pol_claims_lowlat_v1
workflow: fn_extract_icd10_v3
objectives:
  p95_latency_ms: 300
  success_rate: 0.995
  budget_cpm_usd: 3.50
priority: latency_then_cost
routes:
  - id: groq_fast
    match: {capability: "general", context_len_lt: 64k}
    provider: groq
    model: "llama-4-70b"
    region: "us-central"
    min_health: 0.97
    features: {speculative_decoding: true}
  - id: openai_hedge
    provider: openai
    model: "o4-mini"
    when: {groq_fast.health_below: 0.97 OR traffic_spike: true}
fallbacks:
  - openai_hedge
admission_control:
  max_tps: 2500
  drop_policy: queue_then_degrade`;

  const handleSimulation = () => {
    setSimulationRunning(true);
    setTimeout(() => setSimulationRunning(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <GlassmorphicTheme variant="hero" className="p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <GitBranch className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Policy-as-Budget Routing
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Multi-objective AI routing with SLO-first decision making
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button onClick={handleSimulation} disabled={simulationRunning}>
                <Play className="h-4 w-4 mr-2" />
                {simulationRunning ? 'Simulating...' : 'Run Simulation'}
              </Button>
            </div>
          </div>
        </GlassmorphicTheme>

        {/* Active Policies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((policy) => (
            <GlassmorphicTheme key={policy.id} variant="card">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{policy.name}</h3>
                      <p className="text-sm text-muted-foreground">{policy.workflow}</p>
                    </div>
                    <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                      {policy.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">p95 Target</p>
                      <p className="font-medium">{policy.slo.p95_latency_ms}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget Cap</p>
                      <p className="font-medium">${policy.slo.budget_cpm_usd}/1K</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-medium">{(policy.slo.success_rate * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Routes</p>
                      <p className="font-medium">{policy.routes.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlassmorphicTheme>
          ))}
        </div>

        {/* Main Content */}
        <GlassmorphicTheme variant="card" className="rounded-2xl">
          <Tabs defaultValue="routes" className="p-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="routes">Route Health</TabsTrigger>
              <TabsTrigger value="decisions">Decisions</TabsTrigger>
              <TabsTrigger value="scoring">Scoring</TabsTrigger>
              <TabsTrigger value="editor">Policy Editor</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
            </TabsList>

            <TabsContent value="routes" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Route Health & Capacity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {routeHealth.map((route, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              route.health >= 98 ? 'bg-green-500' :
                              route.health >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                            } animate-pulse`} />
                            <div>
                              <h4 className="font-semibold">{route.name}</h4>
                              <p className="text-sm text-muted-foreground">{route.region}</p>
                            </div>
                          </div>
                          <Badge variant={route.health >= 98 ? 'default' : 'secondary'}>
                            {route.health}% Health
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">TPS Capacity</p>
                            <p className="font-medium">{route.tps.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">p95 Latency</p>
                            <p className="font-medium">{route.latency_p95}ms</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cost/1K TU</p>
                            <p className="font-medium">${route.cost_per_1k}</p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              route.health >= 98 ? 'bg-green-500' :
                              route.health >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${route.health}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="decisions" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Routing Decisions Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={routingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="groq" stackId="a" fill="#10b981" name="Groq LPU" />
                      <Bar dataKey="openai" stackId="a" fill="#3b82f6" name="OpenAI" />
                      <Bar dataKey="anthropic" stackId="a" fill="#8b5cf6" name="Anthropic" />
                      <Bar dataKey="vllm" stackId="a" fill="#f59e0b" name="vLLM" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Routing Decisions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { workflow: 'fn_extract_icd10_v3', chosen: 'groq_fast', reason: 'Optimal latency + cost', utility: 0.94, time: '2s ago' },
                      { workflow: 'fn_diagnosis_mapper', chosen: 'openai_hedge', reason: 'Groq health below threshold', utility: 0.87, time: '8s ago' },
                      { workflow: 'fn_parse_medical_doc', chosen: 'groq_fast', reason: 'Best utility score', utility: 0.91, time: '15s ago' },
                      { workflow: 'fn_hipaa_validator', chosen: 'vllm_fallback', reason: 'Cost optimization', utility: 0.82, time: '23s ago' }
                    ].map((decision, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{decision.workflow}</span>
                            <Badge variant="outline">{decision.chosen}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{decision.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Utility: {decision.utility}</p>
                          <p className="text-xs text-muted-foreground">{decision.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scoring" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Objective Scoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-muted/20">
                      <p className="text-sm font-mono mb-2">
                        Utility = w1*(SLO_feasibility) + w2*(Cost_savings) + w3*(Quality_proxy)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Online bandit optimization for per-workflow weight tuning
                      </p>
                    </div>

                    {scoringFactors.map((factor, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{factor.factor}</span>
                            <span className="text-sm text-muted-foreground ml-2">(weight: {factor.weight})</span>
                          </div>
                          <span className="font-bold">{(factor.current * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${factor.current * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="editor" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Policy Editor (RPL)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Policy YAML</Label>
                    <Textarea
                      value={sampleRPL}
                      className="font-mono text-sm h-96"
                      readOnly
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button>Validate</Button>
                    <Button variant="outline">Dry Run</Button>
                    <Button variant="outline">Deploy</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="simulation" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Policy Simulation & Testing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Workflow ID</Label>
                      <Input placeholder="fn_extract_icd10_v3" />
                    </div>
                    <div className="space-y-2">
                      <Label>Context Length</Label>
                      <Input type="number" placeholder="4500" />
                    </div>
                    <div className="space-y-2">
                      <Label>Latency SLO (ms)</Label>
                      <Input type="number" placeholder="300" />
                    </div>
                    <div className="space-y-2">
                      <Label>Domain</Label>
                      <Input placeholder="medical_coding" />
                    </div>
                  </div>

                  {simulationRunning && (
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
                        <span className="text-sm">Running simulation...</span>
                      </div>
                    </div>
                  )}

                  {!simulationRunning && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-semibold mb-2">Simulation Result</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Chosen Route:</span>
                            <span className="font-medium">groq_fast</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Predicted Latency:</span>
                            <span className="font-medium">142ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Predicted Cost:</span>
                            <span className="font-medium">$0.0017</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Utility Score:</span>
                            <span className="font-medium">0.94</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </GlassmorphicTheme>
      </div>
    </div>
  );
};

export default PolicyBudgetRouting;
