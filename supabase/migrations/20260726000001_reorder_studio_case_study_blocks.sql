create or replace function public.reorder_studio_case_study_blocks(
  p_case_study_id uuid,
  p_ordered_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  persisted_ids uuid[];
  submitted_ids uuid[];
begin
  perform 1
  from public.studio_case_studies
  where id = p_case_study_id
  for update;

  if not found then
    raise exception 'Case study not found.' using errcode = 'P0002';
  end if;

  perform 1
  from public.studio_case_study_blocks
  where case_study_id = p_case_study_id
  for update;

  select coalesce(array_agg(id order by id), '{}'::uuid[])
  into persisted_ids
  from public.studio_case_study_blocks
  where case_study_id = p_case_study_id;

  select coalesce(array_agg(id order by id), '{}'::uuid[])
  into submitted_ids
  from unnest(p_ordered_ids) as submitted(id);

  if p_ordered_ids is null or submitted_ids is distinct from persisted_ids then
    raise exception 'orderedIds must include every block for this case study exactly once.' using errcode = '22023';
  end if;

  update public.studio_case_study_blocks as block
  set sort_order = (ordering.position - 1)::integer
  from unnest(p_ordered_ids) with ordinality as ordering(id, position)
  where block.case_study_id = p_case_study_id
    and block.id = ordering.id;
end;
$$;

revoke execute on function public.reorder_studio_case_study_blocks(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.reorder_studio_case_study_blocks(uuid, uuid[]) to service_role;
