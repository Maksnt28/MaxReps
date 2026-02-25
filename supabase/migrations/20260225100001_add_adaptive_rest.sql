ALTER TABLE public.users
  ADD COLUMN rest_seconds_success integer,
  ADD COLUMN rest_seconds_failure integer;
