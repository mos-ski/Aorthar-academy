INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "course_thumbnails_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-thumbnails');

CREATE POLICY "course_thumbnails_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-thumbnails' AND is_admin());

CREATE POLICY "course_thumbnails_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'course-thumbnails' AND is_admin())
  WITH CHECK (bucket_id = 'course-thumbnails' AND is_admin());

CREATE POLICY "course_thumbnails_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'course-thumbnails' AND is_admin());
