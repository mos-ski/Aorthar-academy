// Supabase Edge Function: check-progression
// Validates progression unlock conditions and updates semester_progress
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

    const { target_semester_id } = await req.json();

    // Get semester + year info
    const { data: semester } = await supabase
      .from('semesters')
      .select('*, years(*)')
      .eq('id', target_semester_id)
      .single();

    if (!semester) {
      return Response.json({ error: 'Semester not found' }, { status: 404 });
    }

    const year = semester.years;
    const semNum = semester.number;

    // Check year unlock (if target is year > 100)
    if (year.level > 100) {
      const { data: prevYear } = await supabase
        .from('years')
        .select('id')
        .eq('level', year.level - 100)
        .single();

      if (prevYear) {
        const { data: yearDone } = await supabase.rpc('year_completed', {
          p_user_id: user.id,
          p_year_id: prevYear.id,
        });

        if (!yearDone) {
          return Response.json({
            data: {
              unlocked: false,
              reason: `Complete all Year ${year.level - 100} courses first.`,
            },
          }, { headers: corsHeaders });
        }
      }
    }

    // Check semester 2 unlock
    if (semNum === 2) {
      const { data: sem1 } = await supabase
        .from('semesters')
        .select('id')
        .eq('year_id', year.id)
        .eq('number', 1)
        .single();

      if (sem1) {
        const { data: sem1Done } = await supabase.rpc('semester_completed', {
          p_user_id: user.id,
          p_semester_id: sem1.id,
        });

        if (!sem1Done) {
          return Response.json({
            data: {
              unlocked: false,
              reason: `Complete all Year ${year.level} Semester 1 courses first.`,
            },
          }, { headers: corsHeaders });
        }
      }
    }

    // Check premium requirement for 400-level
    if (year.level === 400) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!sub) {
        return Response.json({
          data: { unlocked: false, reason: 'Year 400 requires a Premium subscription.' },
        }, { headers: corsHeaders });
      }
    }

    // All checks passed — unlock the semester
    await supabase
      .from('semester_progress')
      .upsert({
        user_id: user.id,
        year_id: year.id,
        semester_id: target_semester_id,
        is_unlocked: true,
        unlocked_at: new Date().toISOString(),
      }, { onConflict: 'user_id,semester_id' });

    return Response.json({
      data: { unlocked: true },
    }, { headers: corsHeaders });

  } catch (err) {
    console.error('check-progression error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
