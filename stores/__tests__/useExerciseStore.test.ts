import { describe, it, expect, beforeEach } from 'vitest'
import { useExerciseStore } from '../useExerciseStore'

describe('useExerciseStore', () => {
  beforeEach(() => {
    useExerciseStore.setState({
      filters: {
        search: '',
        muscleGroup: null,
        equipment: null,
        category: null,
      },
    })
  })

  it('initializes with empty filters', () => {
    const state = useExerciseStore.getState()
    expect(state.filters.search).toBe('')
    expect(state.filters.muscleGroup).toBeNull()
    expect(state.filters.equipment).toBeNull()
  })

  it('updates search filter', () => {
    useExerciseStore.getState().setSearch('bench press')
    expect(useExerciseStore.getState().filters.search).toBe('bench press')
  })

  it('clears all filters', () => {
    useExerciseStore.getState().setSearch('squat')
    useExerciseStore.getState().setMuscleGroup('legs')
    useExerciseStore.getState().clearFilters()

    const state = useExerciseStore.getState()
    expect(state.filters.search).toBe('')
    expect(state.filters.muscleGroup).toBeNull()
  })
})
