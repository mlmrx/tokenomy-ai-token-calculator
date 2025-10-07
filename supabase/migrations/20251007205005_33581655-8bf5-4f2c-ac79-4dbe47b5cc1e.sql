-- Fix security warning: Function search_path
DROP FUNCTION IF EXISTS public.calculate_tu(TEXT, TEXT, INTEGER, INTEGER);

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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;