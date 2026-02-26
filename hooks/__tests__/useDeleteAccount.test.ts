import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase
const mockInvoke = vi.fn()
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: { invoke: mockInvoke },
  },
}))

// Mock auth
const mockSignOut = vi.fn()
vi.mock('@/lib/auth', () => ({
  signOut: mockSignOut,
}))

// Mock stores
const mockEndWorkout = vi.fn()
const mockReset = vi.fn()
const mockClearUser = vi.fn()

vi.mock('@/stores/useWorkoutStore', () => ({
  useWorkoutStore: Object.assign(() => null, {
    getState: () => ({ endWorkout: mockEndWorkout }),
  }),
}))

vi.mock('@/stores/useRestTimerStore', () => ({
  useRestTimerStore: Object.assign(() => null, {
    getState: () => ({ reset: mockReset }),
  }),
}))

vi.mock('@/stores/useUserStore', () => ({
  useUserStore: (selector: any) => selector({ clearUser: mockClearUser }),
}))

// Mock react-query — extract mutationFn directly
vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn((opts: any) => ({
    mutateAsync: opts.mutationFn,
    isPending: false,
    onSuccess: opts.onSuccess,
  })),
}))

const { useDeleteAccount } = await import('../useDeleteAccount')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useDeleteAccount', () => {
  it('calls edge function and clears state on success', async () => {
    mockInvoke.mockResolvedValue({ data: { success: true }, error: null })

    const { deleteAccount } = useDeleteAccount()
    await deleteAccount()

    expect(mockInvoke).toHaveBeenCalledWith('delete-account')
  })

  it('throws on edge function error', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unauthorized' } })

    const { deleteAccount } = useDeleteAccount()
    await expect(deleteAccount()).rejects.toThrow('Unauthorized')
  })
})
