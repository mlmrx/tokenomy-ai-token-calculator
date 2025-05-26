
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Get the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { key_name, permissions = [], rate_limit_per_hour = 1000, expires_at } = await req.json()

    if (!key_name) {
      throw new Error('Key name is required')
    }

    // Generate API key
    const { data: apiKeyData, error: keyError } = await supabaseClient.rpc('generate_api_key')
    if (keyError) throw keyError

    const apiKey = apiKeyData as string
    const prefix = apiKey.substring(0, 7)
    
    // Hash the API key for storage (in production, use proper hashing)
    const encoder = new TextEncoder()
    const data = encoder.encode(apiKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Store the API key in the database
    const { data: storedKey, error: storeError } = await supabaseClient
      .from('api_keys')
      .insert({
        user_id: user.id,
        key_name,
        api_key_hash: hashHex,
        api_key_prefix: prefix,
        permissions: JSON.stringify(permissions),
        rate_limit_per_hour,
        expires_at,
        is_active: true
      })
      .select()
      .single()

    if (storeError) throw storeError

    return new Response(
      JSON.stringify({ 
        api_key: apiKey,
        key_data: storedKey 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

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
