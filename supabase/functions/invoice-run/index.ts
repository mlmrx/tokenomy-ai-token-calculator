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
    const { tenant_id, period_start, period_end } = await req.json();

    if (!tenant_id) {
      return new Response(
        JSON.stringify({ error: "tenant_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const periodStartDate = period_start
      ? new Date(period_start)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const periodEndDate = period_end
      ? new Date(period_end)
      : new Date(periodStartDate.getFullYear(), periodStartDate.getMonth() + 1, 0);

    // Get uninvoiced ledger entries
    const { data: ledgerEntries, error: ledgerError } = await supabaseClient
      .from("usage_ledger")
      .select("*")
      .eq("tenant_id", tenant_id)
      .eq("invoiced", false)
      .gte("ts", periodStartDate.toISOString())
      .lte("ts", periodEndDate.toISOString());

    if (ledgerError) {
      throw ledgerError;
    }

    if (!ledgerEntries || ledgerEntries.length === 0) {
      return new Response(
        JSON.stringify({ message: "No uninvoiced usage found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate totals
    const subtotal = ledgerEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.amount_usd),
      0
    );

    // Apply credits
    const { data: credits } = await supabaseClient
      .from("credits")
      .select("*")
      .eq("tenant_id", tenant_id)
      .gt("balance_usd", 0)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order("created_at", { ascending: true });

    let creditsApplied = 0;
    let remainingToCredit = subtotal;

    const creditUpdates = [];
    for (const credit of credits || []) {
      if (remainingToCredit <= 0) break;

      const amountToUse = Math.min(
        parseFloat(credit.balance_usd),
        remainingToCredit
      );
      creditsApplied += amountToUse;
      remainingToCredit -= amountToUse;

      creditUpdates.push({
        id: credit.id,
        balance_usd: parseFloat(credit.balance_usd) - amountToUse,
      });
    }

    // Create invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}-${crypto.randomUUID().split("-")[0].toUpperCase()}`;

    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        tenant_id,
        status: "finalized",
        period_start: periodStartDate.toISOString(),
        period_end: periodEndDate.toISOString(),
        subtotal_usd: subtotal,
        credits_applied_usd: creditsApplied,
        tax_usd: 0,
        total_usd: subtotal - creditsApplied,
        finalized_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (invoiceError) {
      throw invoiceError;
    }

    // Create invoice items (group by workflow)
    const workflowGroups: Record<string, any[]> = {};
    ledgerEntries.forEach((entry) => {
      const workflow = entry.workflow_id || "Unassigned";
      if (!workflowGroups[workflow]) {
        workflowGroups[workflow] = [];
      }
      workflowGroups[workflow].push(entry);
    });

    const invoiceItems = Object.entries(workflowGroups).map(
      ([workflow, entries]) => ({
        invoice_id: invoice.id,
        description: `${workflow} - Token Usage`,
        quantity: entries.length,
        unit_price_usd: entries.reduce((sum, e) => sum + parseFloat(e.amount_usd), 0) / entries.length,
        amount_usd: entries.reduce((sum, e) => sum + parseFloat(e.amount_usd), 0),
        metadata: { workflow, entry_count: entries.length },
      })
    );

    await supabaseClient.from("invoice_items").insert(invoiceItems);

    // Mark ledger entries as invoiced
    const { error: updateError } = await supabaseClient
      .from("usage_ledger")
      .update({ invoiced: true, invoice_id: invoice.id })
      .in(
        "id",
        ledgerEntries.map((e) => e.id)
      );

    if (updateError) {
      throw updateError;
    }

    // Update credit balances
    if (creditUpdates.length > 0) {
      for (const update of creditUpdates) {
        await supabaseClient
          .from("credits")
          .update({ balance_usd: update.balance_usd })
          .eq("id", update.id);
      }
    }

    return new Response(
      JSON.stringify({
        invoice,
        items: invoiceItems,
        ledger_entries_count: ledgerEntries.length,
        credits_applied: creditsApplied,
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
