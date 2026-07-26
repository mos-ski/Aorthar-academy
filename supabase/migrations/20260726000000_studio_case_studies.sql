create table if not exists public.studio_case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  client text,
  release_date date,
  year text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  tags text[] not null default '{}',
  services text[] not null default '{}',
  featured_in text[] not null default '{}',
  cover_media_type text not null default 'image' check (cover_media_type in ('image', 'video')),
  cover_url text,
  cover_alt text,
  preview_video_url text,
  seo_title text,
  seo_description text,
  og_image_url text,
  created_by uuid references public.profiles(user_id),
  updated_by uuid references public.profiles(user_id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_case_study_blocks (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references public.studio_case_studies(id) on delete cascade,
  type text not null check (type in ('text', 'media_row', 'video', 'quote', 'process_notes', 'credits')),
  sort_order integer not null default 0,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_case_studies_status_order_idx
  on public.studio_case_studies(status, display_order, published_at);

create index if not exists studio_case_studies_featured_idx
  on public.studio_case_studies(is_featured, display_order);

create index if not exists studio_case_study_blocks_case_order_idx
  on public.studio_case_study_blocks(case_study_id, sort_order);

create or replace function public.set_studio_case_studies_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_studio_case_studies_updated_at on public.studio_case_studies;
create trigger set_studio_case_studies_updated_at
  before update on public.studio_case_studies
  for each row execute function public.set_studio_case_studies_updated_at();

drop trigger if exists set_studio_case_study_blocks_updated_at on public.studio_case_study_blocks;
create trigger set_studio_case_study_blocks_updated_at
  before update on public.studio_case_study_blocks
  for each row execute function public.set_studio_case_studies_updated_at();

alter table public.studio_case_studies enable row level security;
alter table public.studio_case_study_blocks enable row level security;

drop policy if exists "Public can read published studio case studies" on public.studio_case_studies;
create policy "Public can read published studio case studies"
  on public.studio_case_studies
  for select
  using (status = 'published');

drop policy if exists "Admins can manage studio case studies" on public.studio_case_studies;
create policy "Admins can manage studio case studies"
  on public.studio_case_studies
  for all
  using (exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
      and COALESCE(profiles.admin_level, 'super_admin') IN ('super_admin', 'content_admin')
  ))
  with check (exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
      and COALESCE(profiles.admin_level, 'super_admin') IN ('super_admin', 'content_admin')
  ));

drop policy if exists "Public can read published studio case study blocks" on public.studio_case_study_blocks;
create policy "Public can read published studio case study blocks"
  on public.studio_case_study_blocks
  for select
  using (exists (
    select 1 from public.studio_case_studies
    where studio_case_studies.id = studio_case_study_blocks.case_study_id
      and studio_case_studies.status = 'published'
  ));

drop policy if exists "Admins can manage studio case study blocks" on public.studio_case_study_blocks;
create policy "Admins can manage studio case study blocks"
  on public.studio_case_study_blocks
  for all
  using (exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
      and COALESCE(profiles.admin_level, 'super_admin') IN ('super_admin', 'content_admin')
  ))
  with check (exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
      and COALESCE(profiles.admin_level, 'super_admin') IN ('super_admin', 'content_admin')
  ));
