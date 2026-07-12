CREATE POLICY "Public views published results"
ON public.submissions FOR SELECT
USING (
  status = 'submitted'
  AND EXISTS (
    SELECT 1 FROM public.hackathons h
    WHERE h.id = submissions.hackathon_id
      AND h.results_published_at IS NOT NULL
  )
);
GRANT SELECT ON public.submissions TO anon;