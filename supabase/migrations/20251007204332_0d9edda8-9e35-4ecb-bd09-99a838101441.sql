-- Phase 1: Core Telemetry & Cost Tracking Tables

-- Provider/Model price matrix
CREATE TABLE public.price_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'us-central',
  in_cost_per_1k_tu NUMERIC(10, 6) NOT NULL,
  out_cost_per_1k_tu NUMERIC(10, 6) NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_until TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, model, region, effective_from)
);

CREATE INDEX idx_price_matrix_lookup ON public.price_matrix(provider, model, region, effective_from DESC);

-- Token Unit configuration (alpha values for TU calculation)
CREATE TABLE public.tu_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  alpha NUMERIC(4, 2) NOT NULL DEFAULT 1.5,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, model)
);

-- Core telemetry events (hot path, append-only)
CREATE TABLE public.telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id TEXT NOT NULL,
  user_id UUID,
  session_id TEXT NOT NULL,
  call_id TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'us-central',
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  http_status INTEGER NOT NULL DEFAULT 200,
  retry_count INTEGER NOT NULL DEFAULT 0,
  cached BOOLEAN NOT NULL DEFAULT FALSE,
  cost_in_usd NUMERIC(10, 6),
  cost_out_usd NUMERIC(10, 6),
  total_cost_usd NUMERIC(10, 6),
  tu_calculated NUMERIC(12, 2),
  tags JSONB DEFAULT '{}'::jsonb,
  prompt_hash TEXT,
  error_message TEXT,
  trace_id TEXT,
  span_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_telemetry_ts ON public.telemetry_events(ts DESC);
CREATE INDEX idx_telemetry_tenant ON public.telemetry_events(tenant_id, ts DESC);
CREATE INDEX idx_telemetry_session ON public.telemetry_events(session_id, ts DESC);
CREATE INDEX idx_telemetry_tags ON public.telemetry_events USING GIN(tags);
CREATE INDEX idx_telemetry_trace ON public.telemetry_events(trace_id) WHERE trace_id IS NOT NULL;

-- Budget definitions
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  scope TEXT NOT NULL, -- 'workflow', 'agent', 'user', 'global'
  scope_id TEXT,
  budget_type TEXT NOT NULL DEFAULT 'absolute', -- 'absolute' or 'percentage'
  budget_amount_usd NUMERIC(10, 2) NOT NULL,
  window_hours INTEGER NOT NULL DEFAULT 24,
  alert_threshold_pct INTEGER NOT NULL DEFAULT 80,
  alert_channels JSONB DEFAULT '{"slack": false, "email": true}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_budgets_tenant ON public.budgets(tenant_id) WHERE is_active = TRUE;

-- Budget alerts history
CREATE TABLE public.budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_spend_usd NUMERIC(10, 2) NOT NULL,
  budget_amount_usd NUMERIC(10, 2) NOT NULL,
  percentage_used NUMERIC(5, 2) NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_budget_alerts_budget ON public.budget_alerts(budget_id, triggered_at DESC);

-- Phase 2: Advanced Observability Tables

-- SLO profiles
CREATE TABLE public.slo_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  name TEXT NOT NULL,
  p95_latency_ms INTEGER NOT NULL,
  success_rate NUMERIC(5, 4) NOT NULL,
  budget_cpm_usd NUMERIC(10, 6) NOT NULL,
  owner_email TEXT,
  error_budget_percent NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, workflow_id)
);

CREATE INDEX idx_slo_profiles_tenant ON public.slo_profiles(tenant_id) WHERE is_active = TRUE;

-- SLO burn rate tracking
CREATE TABLE public.slo_burn_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slo_profile_id UUID NOT NULL REFERENCES public.slo_profiles(id) ON DELETE CASCADE,
  window_hours INTEGER NOT NULL, -- 1, 6, 24
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error_budget_remaining NUMERIC(5, 2) NOT NULL,
  burn_rate NUMERIC(8, 4) NOT NULL,
  conforming BOOLEAN NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_slo_burn_slo ON public.slo_burn_rates(slo_profile_id, measured_at DESC);

-- Route candidates (for routing analysis)
CREATE TABLE public.route_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  region TEXT NOT NULL,
  predicted_p95_ms INTEGER,
  expected_cost_usd NUMERIC(10, 6),
  health_score NUMERIC(4, 3),
  selected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_route_candidates_call ON public.route_candidates(call_id);

-- Anomaly detection
CREATE TABLE public.anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  anomaly_type TEXT NOT NULL, -- 'cost_spike', 'latency_spike', 'error_rate'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  metric_name TEXT NOT NULL,
  baseline_value NUMERIC(12, 4),
  observed_value NUMERIC(12, 4),
  z_score NUMERIC(8, 4),
  dimension_attribution JSONB DEFAULT '{}'::jsonb,
  auto_ticket_id TEXT,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_anomalies_tenant ON public.anomalies(tenant_id, detected_at DESC);
CREATE INDEX idx_anomalies_unresolved ON public.anomalies(tenant_id) WHERE resolved = FALSE;

-- Phase 3: Commerce & Monetization Tables

-- Usage ledger (append-only, immutable)
CREATE TABLE public.usage_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_id TEXT NOT NULL UNIQUE,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id TEXT NOT NULL,
  user_id UUID,
  workflow_id TEXT,
  tu_in NUMERIC(12, 2) NOT NULL,
  tu_out NUMERIC(12, 2) NOT NULL,
  latency_ms INTEGER NOT NULL,
  unit_price_usd NUMERIC(10, 6) NOT NULL,
  amount_usd NUMERIC(10, 6) NOT NULL,
  pricing_snapshot_id TEXT NOT NULL,
  evidence_ref TEXT,
  telemetry_event_id UUID REFERENCES public.telemetry_events(id),
  invoiced BOOLEAN NOT NULL DEFAULT FALSE,
  invoice_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ledger_tenant ON public.usage_ledger(tenant_id, ts DESC);
CREATE INDEX idx_ledger_uninvoiced ON public.usage_ledger(tenant_id) WHERE invoiced = FALSE;
CREATE INDEX idx_ledger_invoice ON public.usage_ledger(invoice_id) WHERE invoice_id IS NOT NULL;

-- Plans catalog
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL, -- 'per_tu', 'per_minute', 'bundle', 'committed_use'
  base_price_usd NUMERIC(10, 2),
  included_tu BIGINT,
  price_per_1k_tu NUMERIC(10, 6),
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- 'weekly', 'monthly', 'annual'
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tenant entitlements
CREATE TABLE public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  plan_id UUID REFERENCES public.plans(id),
  tu_quota_monthly BIGINT,
  tps_cap INTEGER,
  soft_limit BOOLEAN NOT NULL DEFAULT TRUE,
  quota_reset_day INTEGER NOT NULL DEFAULT 1,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  tu_used_current_period BIGINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id)
);

CREATE INDEX idx_entitlements_tenant ON public.entitlements(tenant_id) WHERE is_active = TRUE;

-- Credits & coupons
CREATE TABLE public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  credit_type TEXT NOT NULL DEFAULT 'promotional', -- 'promotional', 'refund', 'grant'
  amount_usd NUMERIC(10, 2) NOT NULL,
  balance_usd NUMERIC(10, 2) NOT NULL,
  expires_at TIMESTAMPTZ,
  issued_by UUID,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credits_tenant ON public.credits(tenant_id) WHERE balance_usd > 0;

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'finalized', 'paid', 'void'
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  subtotal_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  credits_applied_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_invoice_id TEXT,
  paid_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finalized_at TIMESTAMPTZ
);

CREATE INDEX idx_invoices_tenant ON public.invoices(tenant_id, created_at DESC);
CREATE INDEX idx_invoices_status ON public.invoices(status, due_date);

-- Invoice line items
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL,
  unit_price_usd NUMERIC(10, 6) NOT NULL,
  amount_usd NUMERIC(12, 2) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- Phase 4: Policy Engine & Routing Tables

-- Routing policies (declarative)
CREATE TABLE public.routing_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id TEXT NOT NULL UNIQUE,
  version INTEGER NOT NULL DEFAULT 1,
  tenant_id TEXT NOT NULL,
  scope TEXT NOT NULL, -- 'workflow:claims_extract_v3'
  objectives JSONB NOT NULL, -- { p95_latency_ms, success_rate, budget_cpm_usd }
  priority TEXT NOT NULL DEFAULT 'latency_then_cost',
  routes JSONB NOT NULL, -- array of route definitions
  fallbacks JSONB DEFAULT '[]'::jsonb,
  admission JSONB DEFAULT '{}'::jsonb,
  audit_config JSONB DEFAULT '{"log_decisions": true}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  shadow_mode BOOLEAN NOT NULL DEFAULT FALSE,
  canary_percent INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routing_policies_tenant ON public.routing_policies(tenant_id) WHERE is_active = TRUE;
CREATE INDEX idx_routing_policies_scope ON public.routing_policies(scope) WHERE is_active = TRUE;

-- Policy decision audit log
CREATE TABLE public.policy_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  policy_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  workflow_id TEXT,
  session_id TEXT,
  call_id TEXT,
  request_context JSONB NOT NULL,
  selected_route TEXT NOT NULL,
  utility_score NUMERIC(8, 4),
  explain JSONB,
  hedged BOOLEAN NOT NULL DEFAULT FALSE,
  telemetry_event_id UUID REFERENCES public.telemetry_events(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policy_decisions_policy ON public.policy_decisions(policy_id, ts DESC);
CREATE INDEX idx_policy_decisions_call ON public.policy_decisions(call_id);

-- Route health monitoring
CREATE TABLE public.route_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  region TEXT NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success_rate NUMERIC(5, 4) NOT NULL,
  p50_latency_ms INTEGER NOT NULL,
  p95_latency_ms INTEGER NOT NULL,
  p99_latency_ms INTEGER NOT NULL,
  requests_count INTEGER NOT NULL,
  health_score NUMERIC(4, 3) NOT NULL,
  is_healthy BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_route_health_route ON public.route_health(route_id, measured_at DESC);
CREATE INDEX idx_route_health_provider ON public.route_health(provider, model, measured_at DESC);

-- Enable Row Level Security
ALTER TABLE public.price_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tu_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slo_burn_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routing_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_health ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin-only for now, can be refined per tenant)

-- Price matrix - public read
CREATE POLICY "Public read access to price matrix"
  ON public.price_matrix FOR SELECT
  USING (true);

-- TU config - public read
CREATE POLICY "Public read access to TU config"
  ON public.tu_config FOR SELECT
  USING (true);

-- Telemetry events - authenticated users can insert
CREATE POLICY "Authenticated users can insert telemetry"
  ON public.telemetry_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own telemetry"
  ON public.telemetry_events FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Budgets
CREATE POLICY "Users can manage their budgets"
  ON public.budgets FOR ALL
  USING (auth.uid() = created_by);

-- Budget alerts
CREATE POLICY "Users can view budget alerts"
  ON public.budget_alerts FOR SELECT
  USING (auth.uid() IN (SELECT created_by FROM budgets WHERE id = budget_id));

-- SLO profiles
CREATE POLICY "Authenticated users can manage SLO profiles"
  ON public.slo_profiles FOR ALL
  USING (auth.uid() IS NOT NULL);

-- SLO burn rates - read only
CREATE POLICY "Authenticated users can view SLO burn rates"
  ON public.slo_burn_rates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Route candidates - authenticated
CREATE POLICY "Authenticated users can manage route candidates"
  ON public.route_candidates FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Anomalies - read only
CREATE POLICY "Authenticated users can view anomalies"
  ON public.anomalies FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Usage ledger - authenticated insert, own tenant read
CREATE POLICY "System can insert ledger entries"
  ON public.usage_ledger FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their ledger"
  ON public.usage_ledger FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Plans - public read
CREATE POLICY "Public read access to plans"
  ON public.plans FOR SELECT
  USING (is_active = true);

-- Entitlements - authenticated
CREATE POLICY "Users can view entitlements"
  ON public.entitlements FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Credits - authenticated
CREATE POLICY "Users can view their credits"
  ON public.credits FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Invoices - authenticated
CREATE POLICY "Users can view their invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Invoice items - authenticated
CREATE POLICY "Users can view invoice items"
  ON public.invoice_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Routing policies - authenticated
CREATE POLICY "Users can manage routing policies"
  ON public.routing_policies FOR ALL
  USING (auth.uid() = created_by);

-- Policy decisions - authenticated read
CREATE POLICY "Users can view policy decisions"
  ON public.policy_decisions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Route health - public read
CREATE POLICY "Public read access to route health"
  ON public.route_health FOR SELECT
  USING (true);

-- Insert sample data for price matrix
INSERT INTO public.price_matrix (provider, model, region, in_cost_per_1k_tu, out_cost_per_1k_tu, effective_from) VALUES
('openai', 'o4-mini', 'us-central', 0.15, 0.60, '2025-01-01'),
('openai', 'gpt-5', 'us-central', 5.0, 15.0, '2025-01-01'),
('groq', 'llama-4-70b', 'us-central', 0.05, 0.08, '2025-01-01'),
('groq', 'llama-4-8b', 'us-central', 0.01, 0.02, '2025-01-01'),
('anthropic', 'claude-4-opus', 'us-central', 15.0, 75.0, '2025-01-01'),
('anthropic', 'claude-4-sonnet', 'us-central', 3.0, 15.0, '2025-01-01');

-- Insert sample TU config
INSERT INTO public.tu_config (provider, model, alpha, description) VALUES
('openai', 'o4-mini', 1.5, 'Standard output weighting'),
('openai', 'gpt-5', 1.5, 'Standard output weighting'),
('groq', 'llama-4-70b', 1.3, 'Faster inference, lower output weight'),
('groq', 'llama-4-8b', 1.2, 'Fastest inference'),
('anthropic', 'claude-4-opus', 1.6, 'Premium quality output'),
('anthropic', 'claude-4-sonnet', 1.5, 'Balanced weighting');

-- Insert sample plans
INSERT INTO public.plans (slug, name, description, plan_type, base_price_usd, included_tu, price_per_1k_tu, billing_period, features, display_order) VALUES
('free', 'Free Tier', 'Get started with 100K TU/month', 'bundle', 0, 100000, 0, 'monthly', '{"max_tps": 10, "support": "community"}', 1),
('starter', 'Starter', 'Perfect for small teams', 'per_tu', 49, 1000000, 0.002, 'monthly', '{"max_tps": 100, "support": "email"}', 2),
('pro', 'Professional', 'For growing businesses', 'per_tu', 299, 10000000, 0.0015, 'monthly', '{"max_tps": 500, "support": "priority"}', 3),
('enterprise', 'Enterprise', 'Custom solutions at scale', 'committed_use', 2999, 100000000, 0.001, 'monthly', '{"max_tps": null, "support": "dedicated"}', 4);

-- Create function to calculate TU
CREATE OR REPLACE FUNCTION public.calculate_tu(
  p_provider TEXT,
  p_model TEXT,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER
) RETURNS NUMERIC AS $$
DECLARE
  v_alpha NUMERIC;
BEGIN
  SELECT alpha INTO v_alpha 
  FROM public.tu_config 
  WHERE provider = p_provider AND model = p_model
  LIMIT 1;
  
  IF v_alpha IS NULL THEN
    v_alpha := 1.5; -- default
  END IF;
  
  RETURN p_input_tokens + (v_alpha * p_output_tokens);
END;
$$ LANGUAGE plpgsql STABLE;