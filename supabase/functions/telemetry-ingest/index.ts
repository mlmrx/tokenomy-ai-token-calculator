import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelemetryEvent {
  ts: string;
  tenant_id: string;
  user_id?: string;
  session_id: string;
  call_id: string;
  provider: string;
  model: string;
  region?: string;
  metrics: {
    input_tokens: number;
    output_tokens: number;
    duration_ms: number;
  };
  http?: {
    status?: number;
    retry?: number;
    cached?: boolean;
  };
  cost_raw?: {
    in_usd: number;
    out_usd: number;
  };
  tags?: Record<string, any>;
  trace_id?: string;
  span_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { events } = await req.json();

    if (!Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify({ error: "events array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (events.length > 500) {
      return new Response(
        JSON.stringify({ error: "Max 500 events per batch" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process events in batches
    const processedEvents = await Promise.all(
      events.map(async (event: TelemetryEvent) => {
        // Get price matrix for this provider/model/region
        const { data: priceData } = await supabaseClient
          .from("price_matrix")
          .select("*")
          .eq("provider", event.provider)
          .eq("model", event.model)
          .eq("region", event.region || "us-central")
          .lte("effective_from", new Date().toISOString())
          .or(`effective_until.is.null,effective_until.gte.${new Date().toISOString()}`)
          .order("effective_from", { ascending: false })
          .limit(1)
          .single();

        // Calculate TU
        const { data: tuResult } = await supabaseClient.rpc("calculate_tu", {
          p_provider: event.provider,
          p_model: event.model,
          p_input_tokens: event.metrics.input_tokens,
          p_output_tokens: event.metrics.output_tokens,
        });

        const tu_calculated = tuResult || 0;

        // Calculate costs
        let cost_in_usd = event.cost_raw?.in_usd;
        let cost_out_usd = event.cost_raw?.out_usd;

        if (!cost_in_usd && priceData) {
          cost_in_usd = (event.metrics.input_tokens / 1000) * priceData.in_cost_per_1k_tu;
          cost_out_usd = (event.metrics.output_tokens / 1000) * priceData.out_cost_per_1k_tu;
        }

        const total_cost_usd = (cost_in_usd || 0) + (cost_out_usd || 0);

        return {
          ts: event.ts || new Date().toISOString(),
          tenant_id: event.tenant_id,
          user_id: event.user_id || null,
          session_id: event.session_id,
          call_id: event.call_id,
          provider: event.provider,
          model: event.model,
          region: event.region || "us-central",
          input_tokens: event.metrics.input_tokens,
          output_tokens: event.metrics.output_tokens,
          duration_ms: event.metrics.duration_ms,
          http_status: event.http?.status || 200,
          retry_count: event.http?.retry || 0,
          cached: event.http?.cached || false,
          cost_in_usd,
          cost_out_usd,
          total_cost_usd,
          tu_calculated,
          tags: event.tags || {},
          trace_id: event.trace_id,
          span_id: event.span_id,
        };
      })
    );

    // Insert telemetry events
    const { data, error } = await supabaseClient
      .from("telemetry_events")
      .insert(processedEvents)
      .select();

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Background task: Create usage ledger entries
    EdgeRuntime.waitUntil(
      (async () => {
        const ledgerEntries = data.map((event: any) => ({
          ledger_id: `li_${crypto.randomUUID().split("-")[0]}`,
          ts: event.ts,
          tenant_id: event.tenant_id,
          user_id: event.user_id,
          workflow_id: event.tags?.workflow || null,
          tu_in: event.input_tokens,
          tu_out: event.output_tokens,
          latency_ms: event.duration_ms,
          unit_price_usd: event.total_cost_usd / (event.tu_calculated || 1),
          amount_usd: event.total_cost_usd,
          pricing_snapshot_id: `pr_${event.provider}_${event.model}`,
          evidence_ref: `ev_${event.call_id}`,
          telemetry_event_id: event.id,
        }));

        await supabaseClient.from("usage_ledger").insert(ledgerEntries);
      })()
    );

    return new Response(
      JSON.stringify({
        accepted: data.length,
        ingested_at: new Date().toISOString(),
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
