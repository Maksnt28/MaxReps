import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWorkoutStore } from '../useWorkoutStore'

// Mock expo-crypto
let uuidCounter = 0
vi.mock('expo-crypto', () => ({
  randomUUID: () => `test-uuid-${++uuidCounter}`,
}))

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(() => Promise.resolve(null)),
    setItem: vi.fn(() => Promise.resolve()),
    removeItem: vi.fn(() => Promise.resolve()),
  },
}))

function resetStore() {
  useWorkoutStore.setState({
    isActive: false,
    sessionId: null,
    programDayId: null,
    startedAt: null,
    exercises: [],
    notes: '',
  })
}

describe('useWorkoutStore', () => {
  beforeEach(() => {
    uuidCounter = 0
    resetStore()
  })

  describe('startWorkout', () => {
    it('activates the workout with session id', () => {
      useWorkoutStore.getState().startWorkout('session-1')
      const state = useWorkoutStore.getState()
      expect(state.isActive).toBe(true)
      expect(state.sessionId).toBe('session-1')
      expect(state.startedAt).toBeTruthy()
      expect(state.exercises).toEqual([])
    })

    it('stores programDayId when provided', () => {
      useWorkoutStore.getState().startWorkout('session-1', 'day-1')
      expect(useWorkoutStore.getState().programDayId).toBe('day-1')
    })
  })

  describe('endWorkout', () => {
    it('resets all state', () => {
      useWorkoutStore.getState().startWorkout('session-1')
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().endWorkout()

      const state = useWorkoutStore.getState()
      expect(state.isActive).toBe(false)
      expect(state.sessionId).toBeNull()
      expect(state.startedAt).toBeNull()
      expect(state.exercises).toEqual([])
      expect(state.notes).toBe('')
    })
  })

  describe('addExercise', () => {
    it('adds an exercise with empty sets', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      const exercises = useWorkoutStore.getState().exercises
      expect(exercises).toHaveLength(1)
      expect(exercises[0].exerciseId).toBe('ex-1')
      expect(exercises[0].sets).toEqual([])
    })

    it('does not add duplicate exercises', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().addExercise('ex-1')
      expect(useWorkoutStore.getState().exercises).toHaveLength(1)
    })
  })

  describe('removeExercise', () => {
    it('removes an exercise', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().addExercise('ex-2')
      useWorkoutStore.getState().removeExercise('ex-1')
      const exercises = useWorkoutStore.getState().exercises
      expect(exercises).toHaveLength(1)
      expect(exercises[0].exerciseId).toBe('ex-2')
    })
  })

  describe('addSet', () => {
    it('adds a blank set to an exercise', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().addSet('ex-1')
      const sets = useWorkoutStore.getState().exercises[0].sets
      expect(sets).toHaveLength(1)
      expect(sets[0].setNumber).toBe(1)
      expect(sets[0].weightKg).toBeNull()
      expect(sets[0].reps).toBeNull()
      expect(sets[0].isWarmup).toBe(false)
      expect(sets[0].isCompleted).toBe(false)
    })

    it('auto-increments set number', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().addSet('ex-1')
      useWorkoutStore.getState().addSet('ex-1')
      const sets = useWorkoutStore.getState().exercises[0].sets
      expect(sets[0].setNumber).toBe(1)
      expect(sets[1].setNumber).toBe(2)
    })

    it('pre-fills from last completed non-warmup set', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().addSet('ex-1')

      const setId = useWorkoutStore.getState().exercises[0].sets[0].id
      useWorkoutStore.getState().updateSet('ex-1', setId, { weightKg: 100, reps: 8 })
      useWorkoutStore.getState().completeSet('ex-1', setId)

      useWorkoutStore.getState().addSet('ex-1')
      const newSet = useWorkoutStore.getState().exercises[0].sets[1]
      expect(newSet.weightKg).toBe(100)
      expect(newSet.reps).toBe(8)
    })

    it('does not pre-fill from warmup sets', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().addSet('ex-1')

      const setId = useWorkoutStore.getState().exercises[0].sets[0].id
      useWorkoutStore.getState().updateSet('ex-1', setId, { weightKg: 50, reps: 10 })
      useWorkoutStore.getState().toggleWarmup('ex-1', setId)
      useWorkoutStore.getState().completeSet('ex-1', setId)

      useWorkoutStore.getState().addSet('ex-1')
      const newSet = useWorkoutStore.getState().exercises[0].sets[1]
      expect(newSet.weightKg).toBeNull()
      expect(newSet.reps).toBeNull()
    })
  })

  describe('updateSet', () => {
    it('updates weight on a set', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().addSet('ex-1')
      const setId = useWorkoutStore.getState().exercises[0].sets[0].id
      useWorkoutStore.getState().updateSet('ex-1', setId, { weightKg: 80 })
      expect(useWorkoutStore.getState().exercises[0].sets[0].weightKg).toBe(80)
    })

    it('updates reps on a set', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().addSet('ex-1')
      const setId = useWorkoutStore.getState().exercises[0].sets[0].id
      useWorkoutStore.getState().updateSet('ex-1', setId, { reps: 12 })
      expect(useWorkoutStore.getState().exercises[0].sets[0].reps).toBe(12)
    })

    it('updates RPE on a set', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().addSet('ex-1')
      const setId = useWorkoutStore.getState().exercises[0].sets[0].id
      useWorkoutStore.getState().updateSet('ex-1', setId, { rpe: 8.5 })
      expect(useWorkoutStore.getState().exercises[0].sets[0].rpe).toBe(8.5)
    })
  })

  describe('completeSet', () => {
    it('marks a set as completed with timestamp', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().addSet('ex-1')
      const setId = useWorkoutStore.getState().exercises[0].sets[0].id
      useWorkoutStore.getState().completeSet('ex-1', setId)

      const set = useWorkoutStore.getState().exercises[0].sets[0]
      expect(set.isCompleted).toBe(true)
      expect(set.completedAt).toBeTruthy()
    })
  })

  describe('removeSet', () => {
    it('removes a set and renumbers remaining', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().addSet('ex-1')
      useWorkoutStore.getState().addSet('ex-1')
      useWorkoutStore.getState().addSet('ex-1')

      const firstSetId = useWorkoutStore.getState().exercises[0].sets[0].id
      useWorkoutStore.getState().removeSet('ex-1', firstSetId)

      const sets = useWorkoutStore.getState().exercises[0].sets
      expect(sets).toHaveLength(2)
      expect(sets[0].setNumber).toBe(1)
      expect(sets[1].setNumber).toBe(2)
    })
  })

  describe('toggleWarmup', () => {
    it('toggles the warmup flag', () => {
      useWorkoutStore.getState().addExercise('ex-1')
      useWorkoutStore.getState().addSet('ex-1')
      const setId = useWorkoutStore.getState().exercises[0].sets[0].id

      expect(useWorkoutStore.getState().exercises[0].sets[0].isWarmup).toBe(false)
      useWorkoutStore.getState().toggleWarmup('ex-1', setId)
      expect(useWorkoutStore.getState().exercises[0].sets[0].isWarmup).toBe(true)
      useWorkoutStore.getState().toggleWarmup('ex-1', setId)
      expect(useWorkoutStore.getState().exercises[0].sets[0].isWarmup).toBe(false)
    })
  })

  describe('setNotes', () => {
    it('sets workout notes', () => {
      useWorkoutStore.getState().setNotes('Great session!')
      expect(useWorkoutStore.getState().notes).toBe('Great session!')
    })
  })

  describe('loadProgramDay', () => {
    it('creates no exercises for empty array', () => {
      useWorkoutStore.getState().loadProgramDay([])
      expect(useWorkoutStore.getState().exercises).toEqual([])
    })

    it('creates exercise with correct number of empty sets', () => {
      useWorkoutStore.getState().loadProgramDay([
        { exerciseId: 'ex-1', setsTarget: 3 },
      ])
      const exercises = useWorkoutStore.getState().exercises
      expect(exercises).toHaveLength(1)
      expect(exercises[0].exerciseId).toBe('ex-1')
      expect(exercises[0].sets).toHaveLength(3)
    })

    it('creates multiple exercises in correct order', () => {
      useWorkoutStore.getState().loadProgramDay([
        { exerciseId: 'ex-1', setsTarget: 3 },
        { exerciseId: 'ex-2', setsTarget: 5 },
        { exerciseId: 'ex-3', setsTarget: 1 },
      ])
      const exercises = useWorkoutStore.getState().exercises
      expect(exercises).toHaveLength(3)
      expect(exercises[0].exerciseId).toBe('ex-1')
      expect(exercises[1].exerciseId).toBe('ex-2')
      expect(exercises[2].exerciseId).toBe('ex-3')
      expect(exercises[1].sets).toHaveLength(5)
    })

    it('creates sets with unique UUIDs and correct setNumbers', () => {
      useWorkoutStore.getState().loadProgramDay([
        { exerciseId: 'ex-1', setsTarget: 3 },
      ])
      const sets = useWorkoutStore.getState().exercises[0].sets
      const ids = sets.map((s) => s.id)
      expect(new Set(ids).size).toBe(3)
      expect(sets[0].setNumber).toBe(1)
      expect(sets[1].setNumber).toBe(2)
      expect(sets[2].setNumber).toBe(3)
    })

    it('creates sets with null weight/reps/rpe and isCompleted false', () => {
      useWorkoutStore.getState().loadProgramDay([
        { exerciseId: 'ex-1', setsTarget: 1 },
      ])
      const set = useWorkoutStore.getState().exercises[0].sets[0]
      expect(set.weightKg).toBeNull()
      expect(set.reps).toBeNull()
      expect(set.rpe).toBeNull()
      expect(set.isCompleted).toBe(false)
      expect(set.completedAt).toBeNull()
      expect(set.isWarmup).toBe(false)
    })

    it('replaces existing exercises (clean slate)', () => {
      useWorkoutStore.getState().addExercise('old-ex')
      useWorkoutStore.getState().addSet('old-ex')

      useWorkoutStore.getState().loadProgramDay([
        { exerciseId: 'new-ex', setsTarget: 2 },
      ])

      const exercises = useWorkoutStore.getState().exercises
      expect(exercises).toHaveLength(1)
      expect(exercises[0].exerciseId).toBe('new-ex')
    })
  })
})
