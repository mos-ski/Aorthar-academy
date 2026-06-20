export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateSettings } from './actions';

type Props = { searchParams: Promise<{ saved?: string }> };

export default async function StudioSettingsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('key, value');
  const s = Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? '']));

  const params = await searchParams;
  const saved = params.saved === '1';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Studio Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage contact details and social links for studio.aorthar.com
        </p>
      </div>

      {saved && (
        <div className="rounded-md border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm text-green-400">
          Settings saved successfully.
        </div>
      )}

      <form action={updateSettings} className="space-y-6">
        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              name="contact_email"
              label="Team Notification Email"
              hint="Where contact form submissions are sent"
              defaultValue={s.contact_email}
              type="email"
            />
            <Field
              name="contact_phone"
              label="Phone Number"
              hint="Displayed on the contact page"
              defaultValue={s.contact_phone}
              placeholder="+234 800 000 0000"
            />
            <Field
              name="contact_whatsapp"
              label="WhatsApp Number"
              hint="Shown as a WhatsApp link on the contact page and footer"
              defaultValue={s.contact_whatsapp}
              placeholder="+234 800 000 0000"
            />
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field name="social_instagram" label="Instagram" defaultValue={s.social_instagram} placeholder="https://instagram.com/aorthar" />
            <Field name="social_twitter" label="Twitter / X" defaultValue={s.social_twitter} placeholder="https://x.com/aorthar" />
            <Field name="social_linkedin" label="LinkedIn" defaultValue={s.social_linkedin} placeholder="https://linkedin.com/company/aorthar" />
            <Field name="social_tiktok" label="TikTok" defaultValue={s.social_tiktok} placeholder="https://tiktok.com/@aorthar" />
            <Field name="social_youtube" label="YouTube" defaultValue={s.social_youtube} placeholder="https://youtube.com/@aorthar" />
          </CardContent>
        </Card>

        <button
          type="submit"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  hint,
  defaultValue,
  placeholder,
  type = 'text',
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
}
