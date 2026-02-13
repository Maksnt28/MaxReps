import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Crypto from 'expo-crypto'

export interface WorkoutSet {
  id: string
  exerciseId: string
  setNumber: number
  weightKg: number | null
  reps: number | null
  rpe: number | null
  isWarmup: boolean
  isCompleted: boolean
  completedAt: string | null
}

export interface ActiveExercise {
  exerciseId: string
  sets: WorkoutSet[]
}

interface WorkoutData {
  isActive: boolean
  sessionId: string | null
  programDayId: string | null
  startedAt: string | null
  exercises: ActiveExercise[]
  notes: string
}

interface WorkoutActions {
  startWorkout: (sessionId: string, programDayId?: string) => void
  endWorkout: () => void
  addExercise: (exerciseId: string) => void
  removeExercise: (exerciseId: string) => void
  addSet: (exerciseId: string) => void
  updateSet: (exerciseId: string, setId: string, updates: Partial<Pick<WorkoutSet, 'weightKg' | 'reps' | 'rpe'>>) => void
  removeSet: (exerciseId: string, setId: string) => void
  completeSet: (exerciseId: string, setId: string) => void
  toggleWarmup: (exerciseId: string, setId: string) => void
  setNotes: (notes: string) => void
}

export type WorkoutState = WorkoutData & WorkoutActions

const initialData: WorkoutData = {
  isActive: false,
  sessionId: null,
  programDayId: null,
  startedAt: null,
  exercises: [],
  notes: '',
}

function getLastCompletedSet(sets: WorkoutSet[]): WorkoutSet | undefined {
  for (let i = sets.length - 1; i >= 0; i--) {
    if (sets[i].isCompleted && !sets[i].isWarmup) return sets[i]
  }
  return undefined
}

function renumberSets(sets: WorkoutSet[]): WorkoutSet[] {
  return sets.map((s, i) => ({ ...s, setNumber: i + 1 }))
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      ...initialData,

      startWorkout: (sessionId, programDayId) =>
        set({
          isActive: true,
          sessionId,
          programDayId: programDayId ?? null,
          startedAt: new Date().toISOString(),
          exercises: [],
          notes: '',
        }),

      endWorkout: () => set(initialData),

      addExercise: (exerciseId) =>
        set((state) => {
          if (state.exercises.some((e) => e.exerciseId === exerciseId)) {
            return state
          }
          return {
            exercises: [...state.exercises, { exerciseId, sets: [] }],
          }
        }),

      removeExercise: (exerciseId) =>
        set((state) => ({
          exercises: state.exercises.filter((e) => e.exerciseId !== exerciseId),
        })),

      addSet: (exerciseId) =>
        set((state) => ({
          exercises: state.exercises.map((e) => {
            if (e.exerciseId !== exerciseId) return e
            const lastSet = getLastCompletedSet(e.sets)
            const newSet: WorkoutSet = {
              id: Crypto.randomUUID(),
              exerciseId,
              setNumber: e.sets.length + 1,
              weightKg: lastSet?.weightKg ?? null,
              reps: lastSet?.reps ?? null,
              rpe: null,
              isWarmup: false,
              isCompleted: false,
              completedAt: null,
            }
            return { ...e, sets: [...e.sets, newSet] }
          }),
        })),

      updateSet: (exerciseId, setId, updates) =>
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.exerciseId !== exerciseId
              ? e
              : {
                  ...e,
                  sets: e.sets.map((s) =>
                    s.id !== setId ? s : { ...s, ...updates }
                  ),
                }
          ),
        })),

      removeSet: (exerciseId, setId) =>
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.exerciseId !== exerciseId
              ? e
              : { ...e, sets: renumberSets(e.sets.filter((s) => s.id !== setId)) }
          ),
        })),

      completeSet: (exerciseId, setId) =>
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.exerciseId !== exerciseId
              ? e
              : {
                  ...e,
                  sets: e.sets.map((s) =>
                    s.id !== setId
                      ? s
                      : s.isCompleted
                        ? { ...s, isCompleted: false, completedAt: null }
                        : { ...s, isCompleted: true, completedAt: new Date().toISOString() }
                  ),
                }
          ),
        })),

      toggleWarmup: (exerciseId, setId) =>
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.exerciseId !== exerciseId
              ? e
              : {
                  ...e,
                  sets: e.sets.map((s) =>
                    s.id !== setId ? s : { ...s, isWarmup: !s.isWarmup }
                  ),
                }
          ),
        })),

      setNotes: (notes) => set({ notes }),
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): WorkoutData => ({
        isActive: state.isActive,
        sessionId: state.sessionId,
        programDayId: state.programDayId,
        startedAt: state.startedAt,
        exercises: state.exercises,
        notes: state.notes,
      }),
    }
  )
)
