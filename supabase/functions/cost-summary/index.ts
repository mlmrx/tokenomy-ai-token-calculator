import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const window = url.searchParams.get("window") || "1h";
    const groupBy = url.searchParams.getAll("by");
    const tenantId = url.searchParams.get("tenant_id");

    if (!tenantId) {
      return new Response(
        JSON.stringify({ error: "tenant_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Parse window (e.g., "1h", "24h", "7d")
    const windowMatch = window.match(/^(\d+)([hd])$/);
    if (!windowMatch) {
      return new Response(
        JSON.stringify({ error: "Invalid window format. Use format like '1h', '24h', '7d'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [, amount, unit] = windowMatch;
    const hours = unit === "h" ? parseInt(amount) : parseInt(amount) * 24;

    const fromTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // Build query
    let query = supabaseClient
      .from("telemetry_events")
      .select("total_cost_usd, input_tokens, output_tokens, duration_ms, tags")
      .eq("tenant_id", tenantId)
      .gte("ts", fromTime);

    const { data, error } = await query;

    if (error) {
      console.error("Query error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Aggregate by groupBy dimensions
    const aggregated: Record<string, any> = {};

    data?.forEach((event) => {
      const key = groupBy
        .map((dim) => event.tags?.[dim] || "unknown")
        .join(":");

      if (!aggregated[key]) {
        aggregated[key] = {
          dimensions: Object.fromEntries(
            groupBy.map((dim, i) => [dim, key.split(":")[i]])
          ),
          total_cost: 0,
          total_tokens: 0,
          avg_latency: 0,
          count: 0,
        };
      }

      aggregated[key].total_cost += event.total_cost_usd || 0;
      aggregated[key].total_tokens += event.input_tokens + event.output_tokens;
      aggregated[key].avg_latency += event.duration_ms;
      aggregated[key].count += 1;
    });

    // Calculate averages
    const summary = Object.values(aggregated).map((item) => ({
      ...item,
      avg_latency: item.avg_latency / item.count,
      cost_per_1k_tokens: (item.total_cost / item.total_tokens) * 1000,
    }));

    return new Response(
      JSON.stringify({
        window,
        from: fromTime,
        to: new Date().toISOString(),
        summary,
        total_cost: summary.reduce((sum, s) => sum + s.total_cost, 0),
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
