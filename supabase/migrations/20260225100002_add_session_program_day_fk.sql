-- Add FK from workout_sessions.program_day_id → program_days.id
-- Enables PostgREST join syntax: program_days(name) in .select()
alter table public.workout_sessions
  add constraint workout_sessions_program_day_id_fkey
  foreign key (program_day_id) references public.program_days(id)
  on delete set null;
