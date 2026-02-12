import { create } from 'zustand'

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
type Goal = 'strength' | 'hypertrophy' | 'general_fitness' | 'body_recomp'

interface UserState {
  id: string | null
  displayName: string | null
  experienceLevel: ExperienceLevel | null
  goal: Goal | null
  equipment: string[]
  locale: 'en' | 'fr'
  isOnboarded: boolean

  setUser: (user: Partial<UserState>) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  id: null,
  displayName: null,
  experienceLevel: null,
  goal: null,
  equipment: [],
  locale: 'en',
  isOnboarded: false,

  setUser: (user) => set((state) => ({ ...state, ...user })),
  clearUser: () =>
    set({
      id: null,
      displayName: null,
      experienceLevel: null,
      goal: null,
      equipment: [],
      locale: 'en',
      isOnboarded: false,
    }),
}))
