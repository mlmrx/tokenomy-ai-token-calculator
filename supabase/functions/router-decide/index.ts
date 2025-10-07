import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RouteDecisionRequest {
  workflow_id: string;
  tenant_id: string;
  context_len: number;
  domain?: string;
  target: {
    p95_latency_ms: number;
    success_rate: number;
  };
  features?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: RouteDecisionRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Find active routing policy for this workflow
    const { data: policy, error: policyError } = await supabaseClient
      .from("routing_policies")
      .select("*")
      .eq("tenant_id", request.tenant_id)
      .eq("scope", `workflow:${request.workflow_id}`)
      .eq("is_active", true)
      .single();

    if (policyError || !policy) {
      // Fallback to default routing
      return new Response(
        JSON.stringify({
          route: "default",
          provider: "groq",
          model: "llama-4-70b",
          explain: { reason: "No active policy found, using default" },
          policy_id: null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get route health for each route in policy
    const routes = policy.routes as any[];
    const healthPromises = routes.map(async (route: any) => {
      const { data: health } = await supabaseClient
        .from("route_health")
        .select("*")
        .eq("route_id", route.id)
        .order("measured_at", { ascending: false })
        .limit(1)
        .single();

      return {
        ...route,
        health: health || { health_score: 0.5, is_healthy: true },
      };
    });

    const routesWithHealth = await Promise.all(healthPromises);

    // Multi-objective optimization
    // U = 0.6*SLO_feasibility + 0.3*Cost_savings + 0.1*QoS_proxy
    const scoredRoutes = routesWithHealth.map((route) => {
      const health = route.health;

      // SLO feasibility: Can this route meet targets?
      const latencyFeasible =
        health.p95_latency_ms <= request.target.p95_latency_ms ? 1 : 0.5;
      const successFeasible =
        health.success_rate >= request.target.success_rate ? 1 : 0.5;
      const sloScore = (latencyFeasible + successFeasible) / 2;

      // Cost savings: Groq is cheapest, prioritize it
      const costScore = route.provider === "groq" ? 1 : 0.5;

      // QoS proxy: health score
      const qosScore = health.health_score || 0.5;

      const utility = 0.6 * sloScore + 0.3 * costScore + 0.1 * qosScore;

      return {
        ...route,
        utility,
        explain: {
          slo_score: sloScore,
          cost_score: costScore,
          qos_score: qosScore,
          latency_feasible: latencyFeasible === 1,
          success_feasible: successFeasible === 1,
        },
      };
    });

    // Sort by utility
    scoredRoutes.sort((a, b) => b.utility - a.utility);

    // Select best route
    const selectedRoute = scoredRoutes[0];

    // Log decision
    EdgeRuntime.waitUntil(
      (async () => {
        await supabaseClient.from("policy_decisions").insert({
          policy_id: policy.policy_id,
          tenant_id: request.tenant_id,
          workflow_id: request.workflow_id,
          request_context: request,
          selected_route: selectedRoute.id,
          utility_score: selectedRoute.utility,
          explain: selectedRoute.explain,
        });
      })()
    );

    return new Response(
      JSON.stringify({
        route: selectedRoute.id,
        provider: selectedRoute.provider,
        model: selectedRoute.model,
        region: selectedRoute.region,
        explain: selectedRoute.explain,
        utility_score: selectedRoute.utility,
        policy_id: policy.policy_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
