-- Rename goal → goals, convert text → text[]
ALTER TABLE public.users RENAME COLUMN goal TO goals;
ALTER TABLE public.users
  ALTER COLUMN goals TYPE text[]
  USING CASE WHEN goals IS NOT NULL THEN ARRAY[goals] ELSE '{}'::text[] END;
ALTER TABLE public.users ALTER COLUMN goals SET DEFAULT '{}';

-- Physical profile columns
ALTER TABLE public.users
  ADD COLUMN sex text,
  ADD COLUMN age integer,
  ADD COLUMN height_cm integer,
  ADD COLUMN weight_kg numeric(5,1);
