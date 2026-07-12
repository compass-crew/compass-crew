-- Add publishing/awards fields to hackathons & submissions
ALTER TABLE public.hackathons
  ADD COLUMN IF NOT EXISTS results_published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS leaderboard_frozen BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS final_rank INTEGER,
  ADD COLUMN IF NOT EXISTS award TEXT;

-- Ensure scores index for leaderboard aggregation
CREATE INDEX IF NOT EXISTS scores_submission_idx ON public.scores(submission_id);
CREATE INDEX IF NOT EXISTS scores_judge_idx ON public.scores(judge_id);
CREATE INDEX IF NOT EXISTS certificates_user_idx ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS certificates_code_idx ON public.certificates(code);

-- User can view their own certificates (SELECT policy already allows public read for verify).
-- No new policies needed.