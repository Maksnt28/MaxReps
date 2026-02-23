import { create } from 'zustand'
import type { ExperienceLevel, Goal } from '@/lib/types'

interface OnboardingState {
  experienceLevel: ExperienceLevel | null
  goal: Goal | null
  equipment: string[]
}

interface OnboardingActions {
  setExperienceLevel: (level: ExperienceLevel) => void
  setGoal: (goal: Goal) => void
  toggleEquipment: (item: string) => void
  reset: () => void
}

export type OnboardingStore = OnboardingState & OnboardingActions

const initialState: OnboardingState = {
  experienceLevel: null,
  goal: null,
  equipment: [],
}

export const useOnboardingStore = create<OnboardingStore>()((set, get) => ({
  ...initialState,

  setExperienceLevel: (level) => set({ experienceLevel: level }),

  setGoal: (goal) => set({ goal }),

  toggleEquipment: (item) => {
    const current = get().equipment
    if (current.includes(item)) {
      set({ equipment: current.filter((e) => e !== item) })
    } else {
      set({ equipment: [...current, item] })
    }
  },

  reset: () => set(initialState),
}))
