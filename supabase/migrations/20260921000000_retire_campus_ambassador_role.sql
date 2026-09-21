-- =========================================================================
-- Migration: 20260921000000_retire_campus_ambassador_role.sql
-- Description: Enforce complete retirement of the Campus Ambassador program.
-- Prohibits assignment of campus_ambassador in public.user_roles and
-- issuance of campus_ambassador in public.certificates.
-- =========================================================================

-- Safety purge (verified 0 existing records present prior to execution)
DELETE FROM public.user_roles WHERE role::text = 'campus_ambassador';
DELETE FROM public.certificates WHERE type::text = 'campus_ambassador';

-- Enforce at database level that campus_ambassador cannot be assigned or issued
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_no_campus_ambassador_chk'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_no_campus_ambassador_chk
      CHECK (role::text <> 'campus_ambassador');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'certificates_no_campus_ambassador_chk'
  ) THEN
    ALTER TABLE public.certificates
      ADD CONSTRAINT certificates_no_campus_ambassador_chk
      CHECK (type::text <> 'campus_ambassador');
  END IF;
END $$;

COMMENT ON CONSTRAINT user_roles_no_campus_ambassador_chk ON public.user_roles IS
  'Campus Ambassador program retired. campus_ambassador role assignments prohibited.';

COMMENT ON CONSTRAINT certificates_no_campus_ambassador_chk ON public.certificates IS
  'Campus Ambassador program retired. campus_ambassador certificate issuance prohibited.';
