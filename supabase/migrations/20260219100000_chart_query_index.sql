-- Index for date-range filtered chart queries
-- Covers: WHERE user_id = X AND started_at >= Y (all time-range charts)
CREATE INDEX idx_workout_sessions_user_date
  ON workout_sessions(user_id, started_at DESC);
