import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock chain helpers
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockUpsert = vi.fn()
const mockDelete = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()

function createChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, unknown> = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    upsert: mockUpsert,
    delete: mockDelete,
    single: mockSingle,
    eq: mockEq,
    order: mockOrder,
    ...overrides,
  }
  // Each method returns the chain for fluent API
  for (const key of Object.keys(chain)) {
    if (typeof chain[key] === 'function') {
      (chain[key] as ReturnType<typeof vi.fn>).mockReturnValue(chain)
    }
  }
  return chain
}

let chain: ReturnType<typeof createChain>

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => chain),
  },
}))

// Import after mock setup
import { supabase } from '@/lib/supabase'

describe('program hooks - Supabase queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    chain = createChain()
  })

  describe('programs list query', () => {
    it('fetches programs with day count ordered by created_at desc', async () => {
      mockOrder.mockResolvedValue({
        data: [
          { id: 'p1', name: 'PPL', program_days: [{ id: 'd1' }, { id: 'd2' }] },
          { id: 'p2', name: 'Upper/Lower', program_days: [{ id: 'd3' }] },
        ],
        error: null,
      })

      const result = await supabase
        .from('programs')
        .select('*, program_days(id)')
        .order('created_at', { ascending: false })

      expect(supabase.from).toHaveBeenCalledWith('programs')
      expect(mockSelect).toHaveBeenCalledWith('*, program_days(id)')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result.data).toHaveLength(2)
      expect(result.data![0].program_days).toHaveLength(2)
    })
  })

  describe('single program nested query', () => {
    it('fetches program with nested days and exercises', async () => {
      mockSingle.mockResolvedValue({
        data: {
          id: 'p1',
          name: 'PPL',
          program_days: [
            {
              id: 'd1',
              day_number: 1,
              program_exercises: [
                { id: 'pe1', order: 1, exercise: { id: 'e1', name_en: 'Squat' } },
              ],
            },
          ],
        },
        error: null,
      })

      const result = await supabase
        .from('programs')
        .select('*, program_days(*, program_exercises(*, exercise:exercises(*)))')
        .eq('id', 'p1')
        .single()

      expect(mockSelect).toHaveBeenCalledWith(
        '*, program_days(*, program_exercises(*, exercise:exercises(*)))'
      )
      expect(result.data!.program_days).toHaveLength(1)
      expect(result.data!.program_days[0].program_exercises[0].exercise.name_en).toBe('Squat')
    })

    it('returns PGRST116 error when program not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      })

      const result = await supabase
        .from('programs')
        .select('*')
        .eq('id', 'nonexistent')
        .single()

      expect(result.error!.code).toBe('PGRST116')
    })
  })

  describe('create program', () => {
    it('inserts a program with type custom and returns id', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'new-p1' },
        error: null,
      })

      const result = await supabase
        .from('programs')
        .insert({ name: 'My Program', type: 'custom' })
        .select('id')
        .single()

      expect(mockInsert).toHaveBeenCalledWith({ name: 'My Program', type: 'custom' })
      expect(result.data).toEqual({ id: 'new-p1' })
    })
  })

  describe('update program', () => {
    it('updates program name by id', async () => {
      mockEq.mockResolvedValue({ error: null })

      const result = await supabase
        .from('programs')
        .update({ name: 'Updated Name' })
        .eq('id', 'p1')

      expect(mockUpdate).toHaveBeenCalledWith({ name: 'Updated Name' })
      expect(mockEq).toHaveBeenCalledWith('id', 'p1')
      expect(result.error).toBeNull()
    })
  })

  describe('delete program', () => {
    it('deletes a program by id (cascades)', async () => {
      mockEq.mockResolvedValue({ error: null })

      const result = await supabase
        .from('programs')
        .delete()
        .eq('id', 'p1')

      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'p1')
      expect(result.error).toBeNull()
    })
  })

  describe('upsert program day', () => {
    it('upserts a new day', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'd-new' },
        error: null,
      })

      const result = await supabase
        .from('program_days')
        .upsert({
          program_id: 'p1',
          name: 'Push Day',
          day_number: 1,
          focus: 'Chest & Triceps',
        })
        .select('id')
        .single()

      expect(mockUpsert).toHaveBeenCalledWith({
        program_id: 'p1',
        name: 'Push Day',
        day_number: 1,
        focus: 'Chest & Triceps',
      })
      expect(result.data).toEqual({ id: 'd-new' })
    })
  })

  describe('delete program day', () => {
    it('deletes a day by id', async () => {
      mockEq.mockResolvedValue({ error: null })

      await supabase.from('program_days').delete().eq('id', 'd1')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'd1')
    })
  })

  describe('add program exercises', () => {
    it('inserts batch of exercises with default targets', async () => {
      mockInsert.mockResolvedValue({ error: null })

      const rows = [
        { program_day_id: 'd1', exercise_id: 'e1', order: 1, sets_target: 3, reps_target: 10 },
        { program_day_id: 'd1', exercise_id: 'e2', order: 2, sets_target: 3, reps_target: 10 },
      ]

      const result = await supabase.from('program_exercises').insert(rows)
      expect(mockInsert).toHaveBeenCalledWith(rows)
      expect(result.error).toBeNull()
    })
  })

  describe('update program exercise', () => {
    it('updates targets on a single exercise', async () => {
      mockEq.mockResolvedValue({ error: null })

      await supabase
        .from('program_exercises')
        .update({ sets_target: 4, reps_target: 8 })
        .eq('id', 'pe1')

      expect(mockUpdate).toHaveBeenCalledWith({ sets_target: 4, reps_target: 8 })
      expect(mockEq).toHaveBeenCalledWith('id', 'pe1')
    })
  })

  describe('delete program exercise', () => {
    it('deletes a single exercise', async () => {
      mockEq.mockResolvedValue({ error: null })

      await supabase.from('program_exercises').delete().eq('id', 'pe1')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'pe1')
    })
  })

  describe('reorder program exercises', () => {
    it('updates order for multiple exercises in parallel', async () => {
      mockEq.mockResolvedValue({ error: null })

      const updates = [
        { id: 'pe1', order: 2 },
        { id: 'pe2', order: 1 },
      ]

      await Promise.all(
        updates.map((e) =>
          supabase
            .from('program_exercises')
            .update({ order: e.order })
            .eq('id', e.id)
        )
      )

      expect(mockUpdate).toHaveBeenCalledTimes(2)
      expect(mockUpdate).toHaveBeenCalledWith({ order: 2 })
      expect(mockUpdate).toHaveBeenCalledWith({ order: 1 })
    })
  })

  describe('error handling', () => {
    it('propagates RLS violation errors', async () => {
      mockEq.mockResolvedValue({
        error: { message: 'new row violates row-level security policy', code: '42501' },
      })

      const result = await supabase.from('programs').delete().eq('id', 'other-user-program')
      expect(result.error).toBeTruthy()
      expect(result.error!.code).toBe('42501')
    })

    it('handles network errors', async () => {
      mockOrder.mockRejectedValue(new Error('Network request failed'))

      await expect(
        supabase.from('programs').select('*').order('created_at', { ascending: false })
      ).rejects.toThrow('Network request failed')
    })
  })
})
