import { create } from 'zustand'

interface ExerciseFilters {
  search: string
  muscleGroup: string | null
  equipment: string | null
  category: string | null
}

interface ExerciseState {
  filters: ExerciseFilters
  setSearch: (search: string) => void
  setMuscleGroup: (muscleGroup: string | null) => void
  setEquipment: (equipment: string | null) => void
  setCategory: (category: string | null) => void
  clearFilters: () => void
}

const defaultFilters: ExerciseFilters = {
  search: '',
  muscleGroup: null,
  equipment: null,
  category: null,
}

export const useExerciseStore = create<ExerciseState>((set) => ({
  filters: { ...defaultFilters },

  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),

  setMuscleGroup: (muscleGroup) =>
    set((state) => ({ filters: { ...state.filters, muscleGroup } })),

  setEquipment: (equipment) =>
    set((state) => ({ filters: { ...state.filters, equipment } })),

  setCategory: (category) =>
    set((state) => ({ filters: { ...state.filters, category } })),

  clearFilters: () => set({ filters: { ...defaultFilters } }),
}))
