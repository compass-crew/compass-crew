-- ==============================================================================
-- Migration: 20260920000000_seed_ai_innovation_challenge_2026.sql
-- Description: Adds external_url column to public.hackathons and seeds the
-- real historical Compass Crew AI Innovation Challenge 2026 on Unstop.
-- ==============================================================================

-- 1. Add optional external_url column to public.hackathons
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS external_url text;

-- 2. Seed Compass Crew AI Innovation Challenge 2026
DO $$
DECLARE
  v_admin_id uuid;
  v_hackathon_id uuid := 'a1000000-0000-0000-0000-000000002026'::uuid;
BEGIN
  -- Resolve an existing user account to associate created_by constraint
  SELECT id INTO v_admin_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  IF v_admin_id IS NULL THEN
    SELECT id INTO v_admin_id FROM auth.users WHERE lower(email) = 'compasscrewnetwork.team@gmail.com';
  END IF;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.hackathons (
      id, slug, title, tagline, description, theme, mode, status,
      eligibility, rules, min_team_size, max_team_size,
      registration_opens_at, registration_closes_at, starts_at, ends_at, submission_deadline, results_at,
      external_url, created_by
    ) VALUES (
      v_hackathon_id,
      'compass-crew-ai-innovation-challenge-2026',
      'Compass Crew AI Innovation Challenge 2026',
      'A nationwide challenge empowering student innovators to turn real-world ideas into working AI prototypes.',
      'The Compass Crew AI Innovation Challenge 2026 was a premier national competition organized by Compass Crew in collaboration with Unstop, bringing together undergraduate and postgraduate student builders from across India to solve high-impact challenges using artificial intelligence and emerging technologies.',
      'AI & Emerging Technologies across Education, Healthcare, Business, and Open Innovation',
      'online',
      'completed',
      'Open to undergraduate and postgraduate students across India from recognized colleges and universities. All academic disciplines welcomed.',
      '1. Minimum team size: 1, maximum team size: 5. 2. Inter-college and inter-specialization teams permitted. 3. Team changes after registration deadline require organizer approval. 4. Round 2 deliverables: GitHub repository, README, pitch deck (PPT/PDF), demo video (3-5 min), live demo link.',
      1,
      5,
      '2026-06-15T00:00:00Z',
      '2026-07-28T18:29:00Z',
      '2026-07-20T00:00:00Z',
      '2026-07-31T18:29:00Z',
      '2026-07-30T18:29:00Z',
      '2026-08-05T00:00:00Z',
      'https://unstop.com/p/compass-crew-ai-innovation-challenge-2026-compass-crew-1715679',
      v_admin_id
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      status = 'completed',
      external_url = EXCLUDED.external_url,
      min_team_size = 1,
      max_team_size = 5;

    -- Seed 4 Tracks
    INSERT INTO public.hackathon_tracks (hackathon_id, name, description, sort_order)
    VALUES
      (v_hackathon_id, 'Productivity & Education', 'AI tools, learning assistants, automated synthesis, and academic workflows for students and educators.', 1),
      (v_hackathon_id, 'Healthcare & Social Impact', 'Accessibility, patient assistance, diagnostics support, community health, and social welfare solutions.', 2),
      (v_hackathon_id, 'AI for Business & Finance', 'Operations automation, micro-business finance, smart auditing, and fraud prevention using intelligent models.', 3),
      (v_hackathon_id, 'Open Innovation Challenge', 'Novel applications of generative AI, multi-agent systems, multimodal reasoning, and open-source models.', 4)
    ON CONFLICT DO NOTHING;

    -- Seed Scoring Criteria
    INSERT INTO public.scoring_criteria (hackathon_id, name, description, weight, max_score, sort_order)
    VALUES
      (v_hackathon_id, 'Innovation & Originality', 'Novelty of approach and problem formulation.', 20, 10, 1),
      (v_hackathon_id, 'Technical Implementation', 'Code quality, architecture robustness, and engineering craft.', 20, 10, 2),
      (v_hackathon_id, 'AI Usage & Evals', 'Appropriateness and depth of artificial intelligence integration.', 20, 10, 3),
      (v_hackathon_id, 'Feasibility & Scalability', 'Practical viability and roadmap for real-world adoption.', 15, 10, 4),
      (v_hackathon_id, 'UX & Product Polish', 'Design clarity, intuitiveness, and attention to user experience.', 15, 10, 5),
      (v_hackathon_id, 'Presentation & Demo', 'Clarity of documentation, pitch deck, and video demo.', 10, 10, 6)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
