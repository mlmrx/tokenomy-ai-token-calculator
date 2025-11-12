-- Create function to get current tenant ID from session
-- This function checks if the user has a tenant_id in their session metadata
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'tenant_id')::text,
    ''
  );
$$;

-- Drop the overly permissive policy on telemetry_events
DROP POLICY IF EXISTS "Users can view their own telemetry" ON telemetry_events;

-- Create properly scoped policy that checks both user_id and tenant_id
CREATE POLICY "Users can only view their own telemetry"
ON telemetry_events FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  (tenant_id IS NOT NULL AND tenant_id = get_current_tenant_id())
);

-- Also fix the similarly broad policies on other tables
DROP POLICY IF EXISTS "Users can view their ledger" ON usage_ledger;
CREATE POLICY "Users can view only their tenant's ledger"
ON usage_ledger FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  (tenant_id IS NOT NULL AND tenant_id = get_current_tenant_id())
);

DROP POLICY IF EXISTS "Users can view their invoices" ON invoices;
CREATE POLICY "Users can view only their tenant's invoices"
ON invoices FOR SELECT
USING (tenant_id IS NOT NULL AND tenant_id = get_current_tenant_id());

DROP POLICY IF EXISTS "Users can view policy decisions" ON policy_decisions;
CREATE POLICY "Users can view only their tenant's policy decisions"
ON policy_decisions FOR SELECT
USING (tenant_id IS NOT NULL AND tenant_id = get_current_tenant_id());