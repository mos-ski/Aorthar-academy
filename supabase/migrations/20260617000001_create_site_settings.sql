create table if not exists public.site_settings (
  key        text primary key,
  value      text,
  label      text not null,
  group_name text not null default 'general'
);

alter table public.site_settings enable row level security;

create policy "Public can read settings"
  on public.site_settings for select using (true);

create policy "Admins can update settings"
  on public.site_settings for update
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

insert into public.site_settings (key, label, value, group_name) values
  ('contact_email',     'Team Notification Email', 'aorthardesignteam@gmail.com', 'contact'),
  ('contact_phone',     'Phone Number',            null,                           'contact'),
  ('contact_whatsapp',  'WhatsApp Number',         null,                           'contact'),
  ('social_instagram',  'Instagram URL',           null,                           'social'),
  ('social_twitter',    'Twitter / X URL',         null,                           'social'),
  ('social_linkedin',   'LinkedIn URL',            null,                           'social'),
  ('social_tiktok',     'TikTok URL',              null,                           'social'),
  ('social_youtube',    'YouTube URL',             null,                           'social')
on conflict (key) do nothing;
