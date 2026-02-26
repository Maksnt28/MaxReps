import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // 1. Validate caller (user client with their JWT)
    const userClient = createClient(url, anonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    })
    const {
      data: { user },
      error,
    } = await userClient.auth.getUser()
    if (error || !user) {
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders,
      })
    }

    // 2. Delete public data first (cascades to all child tables)
    const adminClient = createClient(url, serviceRoleKey)
    const { error: dbError } = await adminClient
      .from('users')
      .delete()
      .eq('id', user.id)
    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Delete auth user
    const { error: authError } = await adminClient.auth.admin.deleteUser(
      user.id
    )
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
