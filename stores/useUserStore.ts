import { create } from 'zustand'
import type { ExperienceLevel, Goal, Sex } from '@/lib/types'

// Manual type — keep in sync with users table schema
// is_onboarded is not in generated types (migration added after type gen)
export type UserRow = {
  id: string
  display_name: string | null
  experience_level: string | null
  goals: string[] | null
  equipment: string[] | null
  locale: string | null
  is_onboarded?: boolean | null
  limitations: string[] | null
  schedule: { days_per_week?: number } | null
  sex: string | null
  age: number | null
  height_cm: number | null
  weight_kg: number | null
  [key: string]: unknown
}

interface UserState {
  id: string | null
  displayName: string | null
  experienceLevel: ExperienceLevel | null
  goals: Goal[]
  equipment: string[]
  locale: 'en' | 'fr'
  isOnboarded: boolean
  limitations: string[]
  daysPerWeek: number | null
  sex: Sex | null
  age: number | null
  heightCm: number | null
  weightKg: number | null

  setUser: (user: Partial<UserState>) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  id: null,
  displayName: null,
  experienceLevel: null,
  goals: [],
  equipment: [],
  locale: 'en',
  isOnboarded: false,
  limitations: [],
  daysPerWeek: null,
  sex: null,
  age: null,
  heightCm: null,
  weightKg: null,

  setUser: (user) => set((state) => ({ ...state, ...user })),
  clearUser: () =>
    set({
      id: null,
      displayName: null,
      experienceLevel: null,
      goals: [],
      equipment: [],
      locale: 'en',
      isOnboarded: false,
      limitations: [],
      daysPerWeek: null,
      sex: null,
      age: null,
      heightCm: null,
      weightKg: null,
    }),
}))
