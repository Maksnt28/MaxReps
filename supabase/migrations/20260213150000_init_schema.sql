-- MaxReps Phase 1 Schema
-- Tables: users, exercises, programs, program_days, program_exercises, workout_sessions, workout_sets
-- Includes: RLS policies, triggers, indexes

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

create extension if not exists "uuid-ossp" with schema extensions;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users (profile, linked to auth.users)
create table public.users (
  id uuid primary key default auth.uid(),
  display_name text,
  experience_level text,
  goal text,
  equipment text[] default '{}',
  schedule jsonb,
  limitations text[] default '{}',
  locale text default 'en',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Exercises (global library, read-only for users)
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_fr text not null,
  muscle_primary text not null,
  muscle_secondary text[] default '{}',
  equipment text not null,
  category text not null,
  cues_en text,
  cues_fr text,
  animation_url text,
  difficulty text not null,
  created_at timestamptz default now() not null
);

-- Programs
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('custom', 'ai_generated')),
  source_prompt_version uuid,
  is_active boolean default false not null,
  created_at timestamptz default now() not null
);

-- Program days
create table public.program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.users(id) on delete cascade,
  day_number int not null,
  name text not null,
  focus text
);

-- Program exercises
create table public.program_exercises (
  id uuid primary key default gen_random_uuid(),
  program_day_id uuid not null references public.program_days(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  "order" int not null,
  sets_target int not null,
  reps_target int not null,
  rpe_target numeric,
  rest_seconds int,
  notes text
);

-- Workout sessions
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users(id) on delete cascade,
  program_day_id uuid,
  started_at timestamptz default now() not null,
  finished_at timestamptz,
  duration_seconds int,
  notes text
);

-- Workout sets
create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  set_number int not null,
  weight_kg numeric,
  reps int,
  rpe numeric,
  is_warmup boolean default false not null,
  is_pr boolean default false not null,
  completed_at timestamptz default now() not null
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- FK indexes (Postgres only auto-indexes PKs, not FK columns)
create index idx_programs_user_id on public.programs(user_id);
create index idx_program_days_program_id on public.program_days(program_id);
create index idx_program_days_user_id on public.program_days(user_id);
create index idx_program_exercises_program_day_id on public.program_exercises(program_day_id);
create index idx_program_exercises_user_id on public.program_exercises(user_id);
create index idx_workout_sessions_user_id on public.workout_sessions(user_id);
create index idx_workout_sets_session_id on public.workout_sets(session_id);
create index idx_workout_sets_user_id on public.workout_sets(user_id);

-- Search indexes (for <200ms exercise search target)
create index idx_exercises_muscle_primary on public.exercises(muscle_primary);
create index idx_exercises_equipment on public.exercises(equipment);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on users table
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_users_updated
  before update on public.users
  for each row
  execute function public.handle_updated_at();

-- Auto-create user profile when auth.users gets a new row
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, display_name, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.raw_user_meta_data->>'locale', 'en')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.exercises enable row level security;
alter table public.programs enable row level security;
alter table public.program_days enable row level security;
alter table public.program_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;

-- Users: own row only
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Exercises: read-only for all authenticated users
create policy "exercises_select_authenticated" on public.exercises
  for select to authenticated using (true);

-- Programs: full CRUD on own rows
create policy "programs_select_own" on public.programs
  for select using (auth.uid() = user_id);

create policy "programs_insert_own" on public.programs
  for insert with check (auth.uid() = user_id);

create policy "programs_update_own" on public.programs
  for update using (auth.uid() = user_id);

create policy "programs_delete_own" on public.programs
  for delete using (auth.uid() = user_id);

-- Program days: full CRUD on own rows
create policy "program_days_select_own" on public.program_days
  for select using (auth.uid() = user_id);

create policy "program_days_insert_own" on public.program_days
  for insert with check (auth.uid() = user_id);

create policy "program_days_update_own" on public.program_days
  for update using (auth.uid() = user_id);

create policy "program_days_delete_own" on public.program_days
  for delete using (auth.uid() = user_id);

-- Program exercises: full CRUD on own rows
create policy "program_exercises_select_own" on public.program_exercises
  for select using (auth.uid() = user_id);

create policy "program_exercises_insert_own" on public.program_exercises
  for insert with check (auth.uid() = user_id);

create policy "program_exercises_update_own" on public.program_exercises
  for update using (auth.uid() = user_id);

create policy "program_exercises_delete_own" on public.program_exercises
  for delete using (auth.uid() = user_id);

-- Workout sessions: full CRUD on own rows
create policy "workout_sessions_select_own" on public.workout_sessions
  for select using (auth.uid() = user_id);

create policy "workout_sessions_insert_own" on public.workout_sessions
  for insert with check (auth.uid() = user_id);

create policy "workout_sessions_update_own" on public.workout_sessions
  for update using (auth.uid() = user_id);

create policy "workout_sessions_delete_own" on public.workout_sessions
  for delete using (auth.uid() = user_id);

-- Workout sets: full CRUD on own rows
create policy "workout_sets_select_own" on public.workout_sets
  for select using (auth.uid() = user_id);

create policy "workout_sets_insert_own" on public.workout_sets
  for insert with check (auth.uid() = user_id);

create policy "workout_sets_update_own" on public.workout_sets
  for update using (auth.uid() = user_id);

create policy "workout_sets_delete_own" on public.workout_sets
  for delete using (auth.uid() = user_id);
