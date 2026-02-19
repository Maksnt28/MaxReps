import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRestTimerStore } from '../useRestTimerStore'

function resetStore() {
  useRestTimerStore.setState({
    isRunning: false,
    exerciseId: null,
    durationSeconds: 0,
    expiresAt: null,
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
  })

  describe('expire', () => {
    it('stops timer', () => {
      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.getState().expire()
      const state = useRestTimerStore.getState()

      expect(state.isRunning).toBe(false)
      // expiresAt preserved for reference
      expect(state.expiresAt).not.toBeNull()
      expect(state.durationSeconds).toBe(90)
    })

    it('no-op when not running', () => {
      const stateBefore = useRestTimerStore.getState()
      useRestTimerStore.getState().expire()
      const stateAfter = useRestTimerStore.getState()

      expect(stateAfter.isRunning).toBe(stateBefore.isRunning)
    })
  })

  describe('addTime', () => {
    it('extends both durationSeconds and expiresAt', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.getState().addTime(30)
      const state = useRestTimerStore.getState()

      expect(state.durationSeconds).toBe(120)
      expect(state.expiresAt).toBe(now + 120000)
    })

    it('when not running is no-op', () => {
      useRestTimerStore.getState().addTime(30)
      const state = useRestTimerStore.getState()

      expect(state.durationSeconds).toBe(0)
      expect(state.expiresAt).toBeNull()
    })
  })

  describe('skip', () => {
    it('resets all state', () => {
      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.getState().skip()
      const state = useRestTimerStore.getState()

      expect(state.isRunning).toBe(false)
      expect(state.exerciseId).toBeNull()
      expect(state.durationSeconds).toBe(0)
      expect(state.expiresAt).toBeNull()
    })
  })

  describe('reset', () => {
    it('clears completely', () => {
      useRestTimerStore.getState().startTimer('ex-1', 90)
      useRestTimerStore.getState().reset()
      const state = useRestTimerStore.getState()

      expect(state.isRunning).toBe(false)
      expect(state.exerciseId).toBeNull()
      expect(state.durationSeconds).toBe(0)
      expect(state.expiresAt).toBeNull()
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
