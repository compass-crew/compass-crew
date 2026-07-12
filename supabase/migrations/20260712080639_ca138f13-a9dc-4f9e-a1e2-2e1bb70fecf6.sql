
CREATE POLICY "cms_media_admin_all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'cms-media' AND public.is_super_admin(auth.uid()))
  WITH CHECK (bucket_id = 'cms-media' AND public.is_super_admin(auth.uid()));
CREATE POLICY "cms_media_auth_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cms-media');
