import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
const mockMaybeSingle = vi.fn()
const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  },
}))

// Mock workout store
const mockEndWorkout = vi.fn()
const mockGetState = vi.fn()

vi.mock('@/stores/useWorkoutStore', () => ({
  useWorkoutStore: Object.assign(mockGetState, {
    getState: mockGetState,
    persist: {
      hasHydrated: () => true,
      onFinishHydration: vi.fn(),
    },
  }),
}))

const { validateOrphanedSession } = await import('../workoutRecovery')
const { checkWorkoutRecovery } = await import('@/hooks/useWorkoutRecovery')

beforeEach(() => {
  vi.clearAllMocks()
  mockGetState.mockReturnValue({
    isActive: false,
    sessionId: null,
    endWorkout: mockEndWorkout,
  })
})

describe('validateOrphanedSession', () => {
  it('returns "valid" when session exists in DB', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'abc' }, error: null })
    expect(await validateOrphanedSession('abc')).toBe('valid')
  })

  it('returns "orphaned" when session not found', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    expect(await validateOrphanedSession('abc')).toBe('orphaned')
  })

  it('returns "valid" on network error (assumes valid)', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'network' } })
    expect(await validateOrphanedSession('abc')).toBe('valid')
  })
})

describe('checkWorkoutRecovery', () => {
  it('no-op when no active workout', async () => {
    mockGetState.mockReturnValue({ isActive: false, sessionId: null, endWorkout: mockEndWorkout })
    await checkWorkoutRecovery()
    expect(mockEndWorkout).not.toHaveBeenCalled()
  })

  it('no-op when active workout is valid', async () => {
    mockGetState.mockReturnValue({ isActive: true, sessionId: 'abc', endWorkout: mockEndWorkout })
    mockMaybeSingle.mockResolvedValue({ data: { id: 'abc' }, error: null })
    await checkWorkoutRecovery()
    expect(mockEndWorkout).not.toHaveBeenCalled()
  })

  it('clears store when session is orphaned', async () => {
    mockGetState.mockReturnValue({ isActive: true, sessionId: 'abc', endWorkout: mockEndWorkout })
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    await checkWorkoutRecovery()
    expect(mockEndWorkout).toHaveBeenCalledOnce()
  })

  it('no-op on network error (assumes valid)', async () => {
    mockGetState.mockReturnValue({ isActive: true, sessionId: 'abc', endWorkout: mockEndWorkout })
    mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'network' } })
    await checkWorkoutRecovery()
    expect(mockEndWorkout).not.toHaveBeenCalled()
  })
})
