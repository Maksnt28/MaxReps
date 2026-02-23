import { describe, it, expect, beforeEach } from 'vitest'
import { useOnboardingStore } from '../useOnboardingStore'

function resetStore() {
  useOnboardingStore.setState({
    experienceLevel: null,
    goal: null,
    equipment: [],
  })
}

describe('useOnboardingStore', () => {
  beforeEach(() => {
    resetStore()
  })

  it('starts with null/empty defaults', () => {
    const state = useOnboardingStore.getState()
    expect(state.experienceLevel).toBeNull()
    expect(state.goal).toBeNull()
    expect(state.equipment).toEqual([])
  })

  it('setExperienceLevel updates value', () => {
    useOnboardingStore.getState().setExperienceLevel('intermediate')
    expect(useOnboardingStore.getState().experienceLevel).toBe('intermediate')
  })

  it('setGoal updates value', () => {
    useOnboardingStore.getState().setGoal('hypertrophy')
    expect(useOnboardingStore.getState().goal).toBe('hypertrophy')
  })

  it('toggleEquipment adds item', () => {
    useOnboardingStore.getState().toggleEquipment('barbell')
    expect(useOnboardingStore.getState().equipment).toEqual(['barbell'])
  })

  it('toggleEquipment removes existing item', () => {
    useOnboardingStore.getState().toggleEquipment('barbell')
    useOnboardingStore.getState().toggleEquipment('dumbbell')
    useOnboardingStore.getState().toggleEquipment('barbell')
    expect(useOnboardingStore.getState().equipment).toEqual(['dumbbell'])
  })

  it('reset clears all fields', () => {
    useOnboardingStore.getState().setExperienceLevel('advanced')
    useOnboardingStore.getState().setGoal('strength')
    useOnboardingStore.getState().toggleEquipment('barbell')
    useOnboardingStore.getState().reset()

    const state = useOnboardingStore.getState()
    expect(state.experienceLevel).toBeNull()
    expect(state.goal).toBeNull()
    expect(state.equipment).toEqual([])
  })
})
