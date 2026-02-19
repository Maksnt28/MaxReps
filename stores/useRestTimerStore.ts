import { create } from 'zustand'

export const DEFAULT_REST_SECONDS = 90

interface RestTimerState {
  isRunning: boolean
  exerciseId: string | null
  durationSeconds: number
  expiresAt: number | null
}

interface RestTimerActions {
  startTimer: (exerciseId: string, durationSeconds: number) => void
  addTime: (seconds: number) => void
  skip: () => void
  expire: () => void
  reset: () => void
}

export type RestTimerStore = RestTimerState & RestTimerActions

const initialState: RestTimerState = {
  isRunning: false,
  exerciseId: null,
  durationSeconds: 0,
  expiresAt: null,
}

export const useRestTimerStore = create<RestTimerStore>()((set, get) => ({
  ...initialState,

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
    set({
      durationSeconds: state.durationSeconds + seconds,
      expiresAt: state.expiresAt + seconds * 1000,
    })
  },

  skip: () => set(initialState),

  expire: () => set({ isRunning: false }),

  reset: () => set(initialState),
}))
