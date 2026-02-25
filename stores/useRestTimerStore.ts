import { create } from 'zustand'

export const DEFAULT_REST_SECONDS = 90

// Per-rest-period state — cleared after each timer expires or is skipped
const timerState = {
  isRunning: false,
  exerciseId: null as string | null,
  durationSeconds: 0,
  expiresAt: null as number | null,
  isAdaptiveFailure: false, // Phase 5: set by ExerciseCard when adaptive failure fires
}

// Per-workout state — survives across rest periods, cleared only on reset()
const sessionState = {
  disabledExerciseIds: [] as string[], // Phase 4: exercises with timer disabled
}

const initialState = { ...timerState, ...sessionState }

interface RestTimerState {
  isRunning: boolean
  exerciseId: string | null
  durationSeconds: number
  expiresAt: number | null
  isAdaptiveFailure: boolean
  disabledExerciseIds: string[]
}

interface RestTimerActions {
  startTimer: (exerciseId: string, durationSeconds: number) => void
  addTime: (seconds: number) => void
  skip: () => void
  expire: () => void
  reset: () => void
  toggleTimerForExercise: (exerciseId: string) => void
}

export type RestTimerStore = RestTimerState & RestTimerActions

export const useRestTimerStore = create<RestTimerStore>()((set, get) => ({
  ...initialState,

  // IMPORTANT: This must remain a partial set() (shallow merge).
  // Zustand's set() preserves unmentioned keys (like disabledExerciseIds).
  // Never add `replace: true` here — it would wipe sessionState.
  startTimer: (exerciseId, durationSeconds) => {
    if (durationSeconds <= 0) return
    set({
      isRunning: true,
      exerciseId,
      durationSeconds,
      expiresAt: Date.now() + durationSeconds * 1000,
    })
  },

  addTime: (seconds) => {
    const state = get()
    if (!state.isRunning || state.expiresAt === null) return
    const newExpires = state.expiresAt + seconds * 1000
    // If subtracting would go past now, expire immediately.
    // NOTE: No haptic here — stores must stay pure (no native module imports).
    // The UI callback (handleSubtract in bandeau/FullScreenTimer) checks
    // !state.isRunning after this call and fires hapticNotification() there.
    if (newExpires <= Date.now()) {
      get().expire()
      return
    }
    // Only update expiresAt — durationSeconds is immutable after startTimer.
    // This preserves correct progress ring behavior (remaining / durationSeconds).
    set({ expiresAt: newExpires })
  },

  // Reset only timer state — preserves session state (disabledExerciseIds)
  skip: () => set({ ...timerState }),

  // Reset only timer state — preserves session state (disabledExerciseIds)
  expire: () => set({ ...timerState }),

  // Full reset — clears timer + session state (end of workout)
  reset: () => set({ ...initialState }),

  toggleTimerForExercise: (exerciseId) =>
    set((state) => ({
      disabledExerciseIds: state.disabledExerciseIds.includes(exerciseId)
        ? state.disabledExerciseIds.filter((id) => id !== exerciseId)
        : [...state.disabledExerciseIds, exerciseId],
    })),
}))
