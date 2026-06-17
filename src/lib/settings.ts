import { createClient } from '@/lib/supabase/server';

export async function getSettings(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('key, value');
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? '']));
}
