create or replace function public.studio_case_study_is_https_url(value text)
returns boolean
language sql
immutable
as $$
  select value ~* '^https://[^[:space:]]+$';
$$;

create or replace function public.studio_case_study_is_video_url(value text)
returns boolean
language sql
immutable
as $$
  select value ~* '^https://(www\.)?vimeo\.com/.+'
    or value ~* '^https://player\.vimeo\.com/video/[0-9]+'
    or value ~* '\.(mp4|m4v|webm|ogv|ogg|mov)(\?.*)?$';
$$;

create or replace function public.studio_case_study_is_image_url(value text)
returns boolean
language sql
immutable
as $$
  select public.studio_case_study_is_https_url(value)
    and not public.studio_case_study_is_video_url(value);
$$;

create or replace function public.validate_studio_case_study_publishable(p_case_study_id uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  study public.studio_case_studies%rowtype;
  block record;
  item jsonb;
  renderable_blocks integer := 0;
begin
  select *
  into study
  from public.studio_case_studies
  where id = p_case_study_id;

  if not found or study.status <> 'published' then
    return;
  end if;

  if nullif(btrim(study.title), '') is null then
    raise exception 'Title is required.' using errcode = '23514';
  end if;
  if nullif(btrim(study.slug), '') is null then
    raise exception 'Slug is required.' using errcode = '23514';
  end if;
  if nullif(btrim(coalesce(study.subtitle, '')), '') is null then
    raise exception 'Subtitle is required before publishing.' using errcode = '23514';
  end if;
  if nullif(btrim(coalesce(study.cover_url, '')), '') is null then
    raise exception 'Cover URL is required before publishing.' using errcode = '23514';
  end if;
  if not public.studio_case_study_is_image_url(study.cover_url) then
    raise exception 'Cover URL must be an HTTPS image before publishing.' using errcode = '23514';
  end if;
  if nullif(btrim(coalesce(study.preview_video_url, '')), '') is not null
    and not public.studio_case_study_is_https_url(study.preview_video_url) then
    raise exception 'Preview video URL must use HTTPS before publishing.' using errcode = '23514';
  end if;
  if nullif(btrim(coalesce(study.og_image_url, '')), '') is not null
    and not public.studio_case_study_is_image_url(study.og_image_url) then
    raise exception 'Open Graph image URL must be an HTTPS image before publishing.' using errcode = '23514';
  end if;
  if nullif(btrim(coalesce(study.year, '')), '') is null and study.release_date is null then
    raise exception 'Year or release date is required before publishing.' using errcode = '23514';
  end if;

  for block in
    select id, type, content
    from public.studio_case_study_blocks
    where case_study_id = p_case_study_id
    order by sort_order, id
  loop
    if jsonb_typeof(block.content) <> 'object' then
      raise exception 'Block content has malformed or unknown fields.' using errcode = '23514';
    end if;

    case block.type
      when 'text' then
        if nullif(btrim(coalesce(block.content->>'body', '')), '') is null then
          raise exception 'Text blocks must include body text before publishing.' using errcode = '23514';
        end if;
        renderable_blocks := renderable_blocks + 1;

      when 'media_row' then
        if coalesce(block.content->>'layout', '') not in ('single', 'pair')
          or jsonb_typeof(block.content->'items') is distinct from 'array'
          or jsonb_array_length(block.content->'items') < 1
          or jsonb_array_length(block.content->'items') > 2 then
          raise exception 'Media row blocks must include valid media before publishing.' using errcode = '23514';
        end if;
        for item in select value from jsonb_array_elements(block.content->'items')
        loop
          if jsonb_typeof(item) is distinct from 'object'
            or coalesce(item->>'type', '') not in ('image', 'video')
            or nullif(btrim(coalesce(item->>'url', '')), '') is null
            or not public.studio_case_study_is_https_url(item->>'url')
            or (item->>'type' = 'image' and not public.studio_case_study_is_image_url(item->>'url')) then
            raise exception 'Media row blocks have an invalid media URL.' using errcode = '23514';
          end if;
        end loop;
        renderable_blocks := renderable_blocks + 1;

      when 'video' then
        if nullif(btrim(coalesce(block.content->>'url', '')), '') is null
          or not public.studio_case_study_is_https_url(block.content->>'url') then
          raise exception 'Video blocks must include an HTTPS video URL before publishing.' using errcode = '23514';
        end if;
        if nullif(btrim(coalesce(block.content->>'coverUrl', '')), '') is not null
          and not public.studio_case_study_is_image_url(block.content->>'coverUrl') then
          raise exception 'Video block covers must be HTTPS image URLs.' using errcode = '23514';
        end if;
        renderable_blocks := renderable_blocks + 1;

      when 'quote' then
        if nullif(btrim(coalesce(block.content->>'quote', '')), '') is null then
          raise exception 'Quote blocks must include quote text before publishing.' using errcode = '23514';
        end if;
        renderable_blocks := renderable_blocks + 1;

      when 'process_notes' then
        if coalesce(block.content->>'orientation', '') not in ('horizontal', 'vertical')
          or nullif(btrim(coalesce(block.content->>'title', '')), '') is null
          or nullif(btrim(coalesce(block.content->>'body', '')), '') is null then
          raise exception 'Process note blocks must include a title and body before publishing.' using errcode = '23514';
        end if;
        if jsonb_typeof(block.content->'images') is distinct from 'array' then
          raise exception 'Process note blocks have malformed images.' using errcode = '23514';
        end if;
        for item in select value from jsonb_array_elements(block.content->'images')
        loop
          if jsonb_typeof(item) is distinct from 'object'
            or nullif(btrim(coalesce(item->>'url', '')), '') is null
            or not public.studio_case_study_is_image_url(item->>'url') then
            raise exception 'Process note blocks have an invalid image URL.' using errcode = '23514';
          end if;
        end loop;
        renderable_blocks := renderable_blocks + 1;

      when 'credits' then
        if jsonb_typeof(block.content->'items') is distinct from 'array'
          or jsonb_array_length(block.content->'items') < 1 then
          raise exception 'Credit blocks must include credit entries before publishing.' using errcode = '23514';
        end if;
        for item in select value from jsonb_array_elements(block.content->'items')
        loop
          if jsonb_typeof(item) is distinct from 'object'
            or nullif(btrim(coalesce(item->>'category', '')), '') is null
            or nullif(btrim(coalesce(item->>'names', '')), '') is null
            or (nullif(btrim(coalesce(item->>'url', '')), '') is not null
              and not public.studio_case_study_is_https_url(item->>'url')) then
            raise exception 'Credit blocks must include complete credit entries before publishing.' using errcode = '23514';
          end if;
        end loop;
        renderable_blocks := renderable_blocks + 1;

      else
        raise exception 'Block has an invalid type.' using errcode = '23514';
    end case;
  end loop;

  if renderable_blocks < 1 then
    raise exception 'At least one renderable content block is required before publishing.' using errcode = '23514';
  end if;
end;
$$;

create or replace function public.validate_studio_case_study_publishable_trigger()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform public.validate_studio_case_study_publishable(new.id);
  return new;
end;
$$;

create or replace function public.lock_studio_case_study_for_block_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  parent_id uuid;
begin
  parent_id := coalesce(new.case_study_id, old.case_study_id);

  perform 1
  from public.studio_case_studies
  where id = parent_id
  for update;

  if not found then
    raise exception 'Case study not found.' using errcode = 'P0002';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function public.validate_studio_case_study_blocks_publishable_trigger()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.validate_studio_case_study_publishable(old.case_study_id);
    return old;
  end if;

  perform public.validate_studio_case_study_publishable(new.case_study_id);
  return new;
end;
$$;

drop trigger if exists validate_studio_case_study_publishable_after_write on public.studio_case_studies;
create trigger validate_studio_case_study_publishable_after_write
  after insert or update on public.studio_case_studies
  for each row execute function public.validate_studio_case_study_publishable_trigger();

drop trigger if exists lock_studio_case_study_before_block_write on public.studio_case_study_blocks;
create trigger lock_studio_case_study_before_block_write
  before insert or update or delete on public.studio_case_study_blocks
  for each row execute function public.lock_studio_case_study_for_block_mutation();

drop trigger if exists validate_studio_case_study_after_block_write on public.studio_case_study_blocks;
create trigger validate_studio_case_study_after_block_write
  after insert or update or delete on public.studio_case_study_blocks
  for each row execute function public.validate_studio_case_study_blocks_publishable_trigger();
