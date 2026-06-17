-- Business agency contact form submissions
create table if not exists public.business_contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  services    text,
  message     text not null,
  status      text not null default 'new' check (status in ('new', 'replied', 'archived')),
  created_at  timestamptz not null default now()
);

-- Only admins can read/update; nobody can insert via client (server action uses service role or anon key with RLS bypass)
alter table public.business_contacts enable row level security;

create policy "Admins can view business contacts"
  on public.business_contacts for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update business contacts"
  on public.business_contacts for update
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Server actions use the anon key but need insert permission
create policy "Allow insert from server actions"
  on public.business_contacts for insert
  with check (true);
