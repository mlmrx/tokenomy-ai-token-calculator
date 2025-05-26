
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

interface MetricData {
  gpu_uuid: string
  timestamp: number
  tps: number
  tokens_total: number
  temperature: number
  power_draw: number
  memory_usage: number
  efficiency: number
  cost_per_mtoken: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check for API key in headers
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      throw new Error('API key is required')
    }

    // Validate API key
    const encoder = new TextEncoder()
    const data = encoder.encode(apiKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: keyData, error: keyError } = await supabaseClient
      .from('api_keys')
      .select('user_id, is_active, rate_limit_per_hour, last_used_at')
      .eq('api_key_hash', hashHex)
      .eq('is_active', true)
      .single()

    if (keyError || !keyData) {
      throw new Error('Invalid API key')
    }

    // Rate limiting check (simplified)
    const now = new Date()
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    // Update last used timestamp
    await supabaseClient
      .from('api_keys')
      .update({ last_used_at: now.toISOString() })
      .eq('api_key_hash', hashHex)

    if (req.method === 'POST') {
      // Ingest metrics data
      const metrics: MetricData | MetricData[] = await req.json()
      const metricsArray = Array.isArray(metrics) ? metrics : [metrics]

      // Validate each metric entry
      for (const metric of metricsArray) {
        if (!metric.gpu_uuid || typeof metric.tps !== 'number') {
          throw new Error('Invalid metric data format')
        }

        // Check if GPU configuration exists for this user
        const { data: gpuConfig, error: configError } = await supabaseClient
          .from('gpu_configurations')
          .select('id, gpu_uuid, max_temperature_c, efficiency_threshold')
          .eq('user_id', keyData.user_id)
          .eq('gpu_uuid', metric.gpu_uuid)
          .single()

        if (configError) {
          console.warn(`GPU configuration not found for ${metric.gpu_uuid}`)
          continue
        }

        // Check for alert conditions
        const alerts = []
        if (metric.temperature > (gpuConfig.max_temperature_c || 80)) {
          alerts.push({
            user_id: keyData.user_id,
            gpu_uuid: metric.gpu_uuid,
            metric_name: 'temperature',
            threshold_value: gpuConfig.max_temperature_c || 80,
            alert_type: metric.temperature > 85 ? 'critical' : 'warning',
            is_enabled: true
          })
        }

        if (metric.efficiency < (gpuConfig.efficiency_threshold || 70)) {
          alerts.push({
            user_id: keyData.user_id,
            gpu_uuid: metric.gpu_uuid,
            metric_name: 'efficiency',
            threshold_value: gpuConfig.efficiency_threshold || 70,
            alert_type: metric.efficiency < 50 ? 'critical' : 'warning',
            is_enabled: true
          })
        }

        // Insert alerts if any
        if (alerts.length > 0) {
          await supabaseClient
            .from('alert_thresholds')
            .upsert(alerts, { onConflict: 'user_id,gpu_uuid,metric_name' })
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: metricsArray.length,
          message: 'Metrics ingested successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } else if (req.method === 'GET') {
      // Retrieve metrics data
      const url = new URL(req.url)
      const gpuUuid = url.searchParams.get('gpu_uuid')
      const limit = parseInt(url.searchParams.get('limit') || '100')
      
      // In a real implementation, this would query a metrics table
      // For now, return mock data
      const mockMetrics = {
        gpu_uuid: gpuUuid,
        current_tps: 1247,
        avg_tps_1m: 1203,
        tokens_total: 847200000,
        temperature: 76,
        power_draw: 320,
        memory_usage: 34567,
        efficiency: 87.3,
        cost_per_mtoken: 3.42
      }

      return new Response(
        JSON.stringify(mockMetrics),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('Method not allowed')

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
