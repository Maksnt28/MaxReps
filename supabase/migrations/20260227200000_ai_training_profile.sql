-- AI Training Profile: preferred split, session duration, and free-form AI notes
ALTER TABLE public.users
  ADD COLUMN preferred_split text,
  ADD COLUMN session_duration_minutes integer,
  ADD COLUMN ai_notes text;
