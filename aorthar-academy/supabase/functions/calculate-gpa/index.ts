// Supabase Edge Function: calculate-gpa
// Computes semester and cumulative GPA server-side
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { semester_id } = await req.json().catch(() => ({}));

    // Trigger semester GPA if semester_id provided
    if (semester_id) {
      const { data: gpa, error } = await supabase.rpc('compute_semester_gpa', {
        p_user_id: user.id,
        p_semester_id: semester_id,
      });
      if (error) throw error;

      // Also recompute cumulative
      await supabase.rpc('compute_cumulative_gpa', { p_user_id: user.id });

      return Response.json({ data: { semester_gpa: gpa } }, { headers: corsHeaders });
    }

    // Recompute cumulative GPA only
    const { data: cumGpa, error: cumError } = await supabase.rpc('compute_cumulative_gpa', {
      p_user_id: user.id,
    });
    if (cumError) throw cumError;

    return Response.json({ data: { cumulative_gpa: cumGpa } }, { headers: corsHeaders });

  } catch (err) {
    console.error('calculate-gpa error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
