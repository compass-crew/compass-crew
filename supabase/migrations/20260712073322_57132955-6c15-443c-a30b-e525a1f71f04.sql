ALTER TYPE public.certificate_type ADD VALUE IF NOT EXISTS 'special_mention';
ALTER TYPE public.certificate_type ADD VALUE IF NOT EXISTS 'volunteer';
-- scores publication notification
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'scores_published';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'judge_assigned';