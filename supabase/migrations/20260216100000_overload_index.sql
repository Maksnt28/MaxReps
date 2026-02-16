CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_history
  ON public.workout_sets(exercise_id, is_warmup)
  WHERE is_warmup = false;
