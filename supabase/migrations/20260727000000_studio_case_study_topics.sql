-- New topics table
create table if not exists public.studio_case_study_topics (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references public.studio_case_studies(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_case_study_topics_case_order_idx
  on public.studio_case_study_topics(case_study_id, sort_order);

-- Add topic_id to blocks (nullable — existing blocks stay unassigned)
alter table public.studio_case_study_blocks
  add column if not exists topic_id uuid references public.studio_case_study_topics(id) on delete set null;

create index if not exists studio_case_study_blocks_topic_idx
  on public.studio_case_study_blocks(topic_id, sort_order);

-- updated_at trigger for topics
create or replace function public.set_studio_case_study_topics_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists set_studio_case_study_topics_updated_at on public.studio_case_study_topics;
create trigger set_studio_case_study_topics_updated_at
  before update on public.studio_case_study_topics
  for each row execute function public.set_studio_case_study_topics_updated_at();

-- RPC for reordering topics
create or replace function public.reorder_studio_case_study_topics(
  p_case_study_id uuid,
  p_ordered_ids uuid[]
)
returns void language plpgsql security definer as $$
begin
  update public.studio_case_study_topics t
  set sort_order = ord.position - 1
  from (
    select unnest(p_ordered_ids) as id, generate_subscripts(p_ordered_ids, 1) as position
  ) as ord
  where t.id = ord.id and t.case_study_id = p_case_study_id;
end; $$;

-- RLS
alter table public.studio_case_study_topics enable row level security;

drop policy if exists "Public can read published studio case study topics" on public.studio_case_study_topics;
create policy "Public can read published studio case study topics"
  on public.studio_case_study_topics
  for select
  using (exists (
    select 1 from public.studio_case_studies
    where studio_case_studies.id = studio_case_study_topics.case_study_id
      and studio_case_studies.status = 'published'
  ));

drop policy if exists "Admins can manage studio case study topics" on public.studio_case_study_topics;
create policy "Admins can manage studio case study topics"
  on public.studio_case_study_topics
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
