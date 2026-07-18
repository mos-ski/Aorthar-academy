-- ─────────────────────────────────────────────────────────────────────────────
-- 20260701095930_contacts_module.sql
-- Read-only admin Contacts directory built from existing product records.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.admin_contacts AS
WITH raw_contacts AS (
  SELECT
    'profile:' || p.user_id::text AS fallback_key,
    NULLIF(lower(trim(u.email)), '') AS normalized_email,
    NULLIF(trim(p.full_name), '') AS full_name,
    NULL::text AS phone,
    'University'::text AS source,
    COALESCE(NULLIF(trim(p.department), ''), initcap(p.role::text), 'University') AS tag,
    p.created_at,
    GREATEST(p.created_at, p.updated_at) AS last_seen_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id

  UNION ALL

  SELECT
    'bootcamp:' || sp.user_id::text AS fallback_key,
    NULLIF(lower(trim(u.email)), '') AS normalized_email,
    NULLIF(trim(COALESCE(p.full_name, u.raw_user_meta_data->>'full_name')), '') AS full_name,
    NULL::text AS phone,
    'Bootcamp'::text AS source,
    'Bootcamp: ' || sc.title AS tag,
    sp.purchased_at AS created_at,
    sp.purchased_at AS last_seen_at
  FROM public.standalone_purchases sp
  JOIN public.standalone_courses sc ON sc.id = sp.course_id
  LEFT JOIN auth.users u ON u.id = sp.user_id
  LEFT JOIN public.profiles p ON p.user_id = sp.user_id

  UNION ALL

  SELECT
    'internship:' || ia.id::text AS fallback_key,
    NULLIF(lower(trim(ia.email)), '') AS normalized_email,
    NULLIF(trim(ia.full_name), '') AS full_name,
    NULLIF(trim(ia.phone), '') AS phone,
    'Internship'::text AS source,
    COALESCE('Internship: ' || NULLIF(initcap(replace(ia.track::text, '_', ' ')), ''), 'Internship') AS tag,
    ia.created_at,
    GREATEST(ia.created_at, COALESCE(ia.form_submitted_at, ia.created_at), COALESCE(ia.paid_at, ia.created_at), ia.updated_at) AS last_seen_at
  FROM public.internship_applications ia
  WHERE NULLIF(trim(ia.email), '') IS NOT NULL
    OR NULLIF(trim(ia.phone), '') IS NOT NULL

  UNION ALL

  SELECT
    'studio:' || sc.id::text AS fallback_key,
    NULLIF(lower(trim(sc.email)), '') AS normalized_email,
    NULLIF(trim(sc.name), '') AS full_name,
    NULL::text AS phone,
    'Studio'::text AS source,
    COALESCE('Studio: ' || NULLIF(trim(sc.services), ''), 'Studio Inquiry') AS tag,
    sc.created_at,
    sc.created_at AS last_seen_at
  FROM public.studio_contacts sc

  UNION ALL

  SELECT
    'webinar:' || wr.id::text AS fallback_key,
    NULLIF(lower(trim(wr.email)), '') AS normalized_email,
    NULLIF(trim(concat_ws(' ', NULLIF(wr.first_name, ''), NULLIF(wr.last_name, ''))), '') AS full_name,
    NULLIF(trim(wr.whatsapp_number), '') AS phone,
    'Webinar'::text AS source,
    'Webinar: ' || w.title AS tag,
    wr.registered_at AS created_at,
    GREATEST(wr.registered_at, COALESCE(wr.attended_at, wr.registered_at)) AS last_seen_at
  FROM public.webinar_registrations wr
  JOIN public.webinars w ON w.id = wr.webinar_id
  WHERE NULLIF(trim(wr.email), '') IS NOT NULL
    OR NULLIF(trim(wr.whatsapp_number), '') IS NOT NULL
    OR wr.user_id IS NOT NULL

  UNION ALL

  SELECT
    'marketplace:' || mp.id::text AS fallback_key,
    NULLIF(lower(trim(mp.email)), '') AS normalized_email,
    NULL::text AS full_name,
    NULL::text AS phone,
    'Marketplace'::text AS source,
    'Marketplace: ' || product.name AS tag,
    mp.created_at,
    GREATEST(mp.created_at, COALESCE(mp.paid_at, mp.created_at), mp.updated_at) AS last_seen_at
  FROM public.marketplace_purchases mp
  JOIN public.marketplace_products product ON product.id = mp.product_id
  WHERE mp.payment_status IN ('paid', 'pending')
),
deduped AS (
  SELECT
    COALESCE(normalized_email, fallback_key) AS contact_key,
    (array_remove(array_agg(full_name ORDER BY created_at), NULL))[1] AS full_name,
    (array_remove(array_agg(normalized_email ORDER BY created_at), NULL))[1] AS email,
    (array_remove(array_agg(phone ORDER BY created_at DESC), NULL))[1] AS phone,
    array_agg(DISTINCT source ORDER BY source) AS sources,
    array_agg(DISTINCT tag ORDER BY tag) FILTER (WHERE tag IS NOT NULL AND tag <> '') AS tags,
    count(DISTINCT source) AS source_count,
    min(created_at) AS created_at,
    max(last_seen_at) AS last_seen_at
  FROM raw_contacts
  GROUP BY COALESCE(normalized_email, fallback_key)
)
SELECT
  contact_key,
  CASE
    WHEN full_name IS NULL THEN NULL
    ELSE split_part(full_name, ' ', 1)
  END AS first_name,
  CASE
    WHEN full_name IS NULL OR position(' ' IN full_name) = 0 THEN NULL
    ELSE regexp_replace(full_name, '^\S+\s*', '')
  END AS last_name,
  full_name,
  email,
  phone,
  sources,
  COALESCE(tags, ARRAY[]::text[]) AS tags,
  source_count,
  created_at,
  last_seen_at
FROM deduped;

REVOKE ALL ON public.admin_contacts FROM anon, authenticated;
GRANT SELECT ON public.admin_contacts TO service_role;

COMMENT ON VIEW public.admin_contacts IS 'Read-only admin Contacts directory deduped across Aorthar product sources.';

NOTIFY pgrst, 'reload schema';
