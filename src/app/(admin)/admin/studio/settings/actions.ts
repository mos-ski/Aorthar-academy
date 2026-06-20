'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const KEYS = [
  'contact_email',
  'contact_phone',
  'contact_whatsapp',
  'social_instagram',
  'social_twitter',
  'social_linkedin',
  'social_tiktok',
  'social_youtube',
] as const;

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();

  await Promise.all(
    KEYS.map((key) =>
      supabase
        .from('site_settings')
        .update({ value: String(formData.get(key) ?? '').trim() || null })
        .eq('key', key),
    ),
  );

  revalidatePath('/admin/studio/settings');
  revalidatePath('/studio');
  redirect('/admin/studio/settings?saved=1');
}
