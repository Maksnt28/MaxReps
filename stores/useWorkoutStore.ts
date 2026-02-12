import { create } from 'zustand'

interface WorkoutSet {
  exerciseId: string
  setNumber: number
  weightKg: number | null
  reps: number | null
  rpe: number | null
  isWarmup: boolean
  completedAt: string | null
}

interface ActiveExercise {
  exerciseId: string
  sets: WorkoutSet[]
}

interface WorkoutState {
  isActive: boolean
  sessionId: string | null
  programDayId: string | null
  startedAt: string | null
  exercises: ActiveExercise[]
  restTimerSeconds: number

  startWorkout: (programDayId?: string) => void
  endWorkout: () => void
  addExercise: (exerciseId: string) => void
  removeExercise: (exerciseId: string) => void
  logSet: (exerciseId: string, set: WorkoutSet) => void
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  isActive: false,
  sessionId: null,
  programDayId: null,
  startedAt: null,
  exercises: [],
  restTimerSeconds: 90,

  startWorkout: (programDayId) =>
    set({
      isActive: true,
      programDayId: programDayId ?? null,
      startedAt: new Date().toISOString(),
      exercises: [],
    }),

  endWorkout: () =>
    set({
      isActive: false,
      sessionId: null,
      programDayId: null,
      startedAt: null,
      exercises: [],
    }),

  addExercise: (exerciseId) =>
    set((state) => ({
      exercises: [...state.exercises, { exerciseId, sets: [] }],
    })),

  removeExercise: (exerciseId) =>
    set((state) => ({
      exercises: state.exercises.filter((e) => e.exerciseId !== exerciseId),
    })),

  logSet: (exerciseId, newSet) =>
    set((state) => ({
      exercises: state.exercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, sets: [...e.sets, newSet] } : e
      ),
    })),
}))
