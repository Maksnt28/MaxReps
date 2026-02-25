import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRestTimerStore } from '../useRestTimerStore'

function resetStore() {
  useRestTimerStore.setState({
    isRunning: false,
    exerciseId: null,
    durationSeconds: 0,
    expiresAt: null,
    isAdaptiveFailure: false,
    disabledExerciseIds: [],
  })
}

describe('useRestTimerStore', () => {
  beforeEach(() => {
    resetStore()
    vi.restoreAllMocks()
  })

  describe('startTimer', () => {
    it('sets correct state', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      useRestTimerStore.getState().startTimer('ex-1', 90)
      const state = useRestTimerStore.getState()

      expect(state.isRunning).toBe(true)
      expect(state.exerciseId).toBe('ex-1')
      expect(state.durationSeconds).toBe(90)
      expect(state.expiresAt).toBe(now + 90000)
    })

    it('overwrites running timer (super-set)', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.getState().startTimer('ex-2', 120)
      const state = useRestTimerStore.getState()

      expect(state.isRunning).toBe(true)
      expect(state.exerciseId).toBe('ex-2')
      expect(state.durationSeconds).toBe(120)
      expect(state.expiresAt).toBe(now + 120000)
    })

    it('with 0 seconds is no-op', () => {
      useRestTimerStore.getState().startTimer('ex-1', 0)
      const state = useRestTimerStore.getState()

      expect(state.isRunning).toBe(false)
      expect(state.exerciseId).toBeNull()
    })

    it('with negative seconds is no-op', () => {
      useRestTimerStore.getState().startTimer('ex-1', -10)
      expect(useRestTimerStore.getState().isRunning).toBe(false)
    })

    it('preserves disabledExerciseIds (shallow merge)', () => {
      useRestTimerStore.setState({ disabledExerciseIds: ['ex-A'] })
      useRestTimerStore.getState().startTimer('ex-1', 90)
      expect(useRestTimerStore.getState().disabledExerciseIds).toEqual(['ex-A'])
    })
  })

  describe('expire', () => {
    it('resets timer state to defaults', () => {
      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.getState().expire()
      const state = useRestTimerStore.getState()

      expect(state.isRunning).toBe(false)
      expect(state.expiresAt).toBeNull()
      expect(state.durationSeconds).toBe(0)
      expect(state.exerciseId).toBeNull()
    })

    it('resets to timer state defaults (idempotent when already reset)', () => {
      const stateBefore = useRestTimerStore.getState()
      useRestTimerStore.getState().expire()
      const stateAfter = useRestTimerStore.getState()

      expect(stateAfter.isRunning).toBe(stateBefore.isRunning)
    })

    it('preserves disabledExerciseIds', () => {
      useRestTimerStore.setState({ disabledExerciseIds: ['ex-A', 'ex-B'] })
      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.getState().expire()

      expect(useRestTimerStore.getState().disabledExerciseIds).toEqual(['ex-A', 'ex-B'])
    })
  })

  describe('addTime', () => {
    it('extends expiresAt only (durationSeconds immutable)', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.getState().addTime(15)
      const state = useRestTimerStore.getState()

      expect(state.durationSeconds).toBe(90)
      expect(state.expiresAt).toBe(now + 105000)
    })

    it('subtracts expiresAt correctly', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.getState().addTime(-15)
      const state = useRestTimerStore.getState()

      expect(state.durationSeconds).toBe(90)
      expect(state.expiresAt).toBe(now + 75000)
    })

    it('triggers expire when subtract would go past now', () => {
      const now = 1000000
      vi.spyOn(Date, 'now').mockReturnValue(now)

      useRestTimerStore.getState().startTimer('ex-1', 10)
      // 10s timer, subtract 15s → newExpires = (now + 10000) - 15000 = now - 5000 < now
      useRestTimerStore.getState().addTime(-15)
      const state = useRestTimerStore.getState()

      expect(state.isRunning).toBe(false)
      expect(state.expiresAt).toBeNull()
      expect(state.durationSeconds).toBe(0)
    })

    it('when not running is no-op', () => {
      useRestTimerStore.getState().addTime(15)
      const state = useRestTimerStore.getState()

      expect(state.durationSeconds).toBe(0)
      expect(state.expiresAt).toBeNull()
    })
  })

  describe('skip', () => {
    it('resets timer state', () => {
      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.getState().skip()
      const state = useRestTimerStore.getState()

      expect(state.isRunning).toBe(false)
      expect(state.exerciseId).toBeNull()
      expect(state.durationSeconds).toBe(0)
      expect(state.expiresAt).toBeNull()
    })

    it('preserves disabledExerciseIds', () => {
      useRestTimerStore.setState({ disabledExerciseIds: ['ex-A'] })
      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.getState().skip()

      expect(useRestTimerStore.getState().disabledExerciseIds).toEqual(['ex-A'])
    })
  })

  describe('reset', () => {
    it('clears everything including session state', () => {
      useRestTimerStore.setState({ disabledExerciseIds: ['ex-A'] })
      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.getState().reset()
      const state = useRestTimerStore.getState()

      expect(state.isRunning).toBe(false)
      expect(state.exerciseId).toBeNull()
      expect(state.durationSeconds).toBe(0)
      expect(state.expiresAt).toBeNull()
      expect(state.disabledExerciseIds).toEqual([])
      expect(state.isAdaptiveFailure).toBe(false)
    })
  })

  describe('toggleTimerForExercise', () => {
    it('adds exercise to disabled list', () => {
      useRestTimerStore.getState().toggleTimerForExercise('ex-1')
      expect(useRestTimerStore.getState().disabledExerciseIds).toEqual(['ex-1'])
    })

    it('removes exercise from disabled list on second toggle', () => {
      useRestTimerStore.getState().toggleTimerForExercise('ex-1')
      useRestTimerStore.getState().toggleTimerForExercise('ex-1')
      expect(useRestTimerStore.getState().disabledExerciseIds).toEqual([])
    })

    it('supports multiple disabled exercises', () => {
      useRestTimerStore.getState().toggleTimerForExercise('ex-1')
      useRestTimerStore.getState().toggleTimerForExercise('ex-2')
      expect(useRestTimerStore.getState().disabledExerciseIds).toEqual(['ex-1', 'ex-2'])
    })
  })

  describe('isAdaptiveFailure', () => {
    it('can be set via setState', () => {
      useRestTimerStore.setState({ isAdaptiveFailure: true })
      expect(useRestTimerStore.getState().isAdaptiveFailure).toBe(true)
    })

    it('is cleared by expire', () => {
      useRestTimerStore.setState({ isAdaptiveFailure: true })
      useRestTimerStore.getState().expire()
      expect(useRestTimerStore.getState().isAdaptiveFailure).toBe(false)
    })

    it('is cleared by skip', () => {
      useRestTimerStore.setState({ isAdaptiveFailure: true })
      useRestTimerStore.getState().skip()
      expect(useRestTimerStore.getState().isAdaptiveFailure).toBe(false)
    })

    it('failure timer replaced by success timer sets flag to false', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      useRestTimerStore.getState().startTimer('ex-1', 180)
      useRestTimerStore.setState({ isAdaptiveFailure: true })

      // Success timer replaces running failure timer before expire
      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.setState({ isAdaptiveFailure: false })

      expect(useRestTimerStore.getState().isAdaptiveFailure).toBe(false)
      expect(useRestTimerStore.getState().isRunning).toBe(true)
    })
  })

  describe('remaining computation', () => {
    it('correct seconds from expiresAt', () => {
      const now = 1000000
      vi.spyOn(Date, 'now').mockReturnValue(now)

      useRestTimerStore.getState().startTimer('ex-1', 90)
      // Simulate 30s passing
      vi.spyOn(Date, 'now').mockReturnValue(now + 30000)

      const { expiresAt } = useRestTimerStore.getState()
      const remaining = Math.max(0, Math.ceil((expiresAt! - Date.now()) / 1000))
      expect(remaining).toBe(60)
    })

    it('returns 0 when expiresAt is in the past', () => {
      const now = 1000000
      vi.spyOn(Date, 'now').mockReturnValue(now)

      useRestTimerStore.getState().startTimer('ex-1', 90)
      // Simulate 120s passing (past expiry)
      vi.spyOn(Date, 'now').mockReturnValue(now + 120000)

      const { expiresAt } = useRestTimerStore.getState()
      const remaining = Math.max(0, Math.ceil((expiresAt! - Date.now()) / 1000))
      expect(remaining).toBe(0)
    })

    it('self-corrects after simulated background pause', () => {
      const now = 1000000
      vi.spyOn(Date, 'now').mockReturnValue(now)

      useRestTimerStore.getState().startTimer('ex-1', 90)
      // Simulate app backgrounded for 60s
      vi.spyOn(Date, 'now').mockReturnValue(now + 60000)

      const { expiresAt } = useRestTimerStore.getState()
      const remaining = Math.max(0, Math.ceil((expiresAt! - Date.now()) / 1000))
      expect(remaining).toBe(30)
    })
  })
})
