import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  createTestUsers,
  deleteTestUsers,
  adminClient,
  clientA,
  clientB,
  userAId,
  userBId,
} from './helpers'

describe.skipIf(!process.env.SUPABASE_SERVICE_ROLE_KEY)(
  'RLS Integration Tests',
  () => {
    let exerciseId: string
    let programId: string
    let programDayId: string
    let programExerciseId: string
    let sessionId: string
    let setId: string

    beforeAll(async () => {
      await createTestUsers()

      // Fetch a real exercise ID from seeded data
      const { data: exercises } = await adminClient
        .from('exercises')
        .select('id')
        .limit(1)
        .single()
      if (!exercises) throw new Error('No exercises found — run supabase db seed first')
      exerciseId = exercises.id

      // Seed test data as User A
      const { data: program, error: progErr } = await clientA
        .from('programs')
        .insert({
          user_id: userAId,
          name: 'RLS Test Program',
          type: 'custom',
        })
        .select('id')
        .single()
      if (progErr) throw new Error(`Failed to seed program: ${progErr.message}`)
      programId = program!.id

      const { data: day, error: dayErr } = await clientA
        .from('program_days')
        .insert({
          user_id: userAId,
          program_id: programId,
          day_number: 1,
          name: 'Day 1',
        })
        .select('id')
        .single()
      if (dayErr) throw new Error(`Failed to seed program_day: ${dayErr.message}`)
      programDayId = day!.id

      const { data: progEx, error: peErr } = await clientA
        .from('program_exercises')
        .insert({
          user_id: userAId,
          program_day_id: programDayId,
          exercise_id: exerciseId,
          order: 0,
          sets_target: 3,
          reps_target: 10,
        })
        .select('id')
        .single()
      if (peErr) throw new Error(`Failed to seed program_exercise: ${peErr.message}`)
      programExerciseId = progEx!.id

      const { data: session, error: sessErr } = await clientA
        .from('workout_sessions')
        .insert({
          user_id: userAId,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single()
      if (sessErr) throw new Error(`Failed to seed session: ${sessErr.message}`)
      sessionId = session!.id

      const { data: set, error: setErr } = await clientA
        .from('workout_sets')
        .insert({
          user_id: userAId,
          session_id: sessionId,
          exercise_id: exerciseId,
          set_number: 1,
          weight_kg: 60,
          reps: 10,
          is_warmup: false,
        })
        .select('id')
        .single()
      if (setErr) throw new Error(`Failed to seed set: ${setErr.message}`)
      setId = set!.id
    }, 60_000)

    afterAll(async () => {
      await deleteTestUsers()
    }, 60_000)

    // ─── users table ─────────────────────────────────────────────

    describe('users', () => {
      it('User A can read own profile', async () => {
        const { data, error } = await clientA
          .from('users')
          .select('id')
          .eq('id', userAId)
          .single()
        expect(error).toBeNull()
        expect(data?.id).toBe(userAId)
      })

      it('User B cannot read User A profile', async () => {
        const { data } = await clientB
          .from('users')
          .select('id')
          .eq('id', userAId)
        expect(data).toEqual([])
      })

      it('User B cannot update User A profile', async () => {
        const { data } = await clientB
          .from('users')
          .update({ display_name: 'hacked' })
          .eq('id', userAId)
          .select()
        expect(data).toEqual([])
      })
    })

    // ─── programs table ──────────────────────────────────────────

    describe('programs', () => {
      it('User A can read own programs', async () => {
        const { data, error } = await clientA
          .from('programs')
          .select('id')
          .eq('id', programId)
          .single()
        expect(error).toBeNull()
        expect(data?.id).toBe(programId)
      })

      it('User B cannot read User A programs', async () => {
        const { data } = await clientB
          .from('programs')
          .select('id')
          .eq('id', programId)
        expect(data).toEqual([])
      })

      it('User B cannot insert with User A user_id', async () => {
        const { error } = await clientB
          .from('programs')
          .insert({
            user_id: userAId,
            name: 'Stolen Program',
            type: 'custom',
          })
        expect(error).not.toBeNull()
      })

      it('User B cannot update User A programs', async () => {
        const { data } = await clientB
          .from('programs')
          .update({ name: 'hacked' })
          .eq('id', programId)
          .select()
        expect(data).toEqual([])
      })

      it('User B cannot delete User A programs', async () => {
        const { data } = await clientB
          .from('programs')
          .delete()
          .eq('id', programId)
          .select()
        expect(data).toEqual([])
      })
    })

    // ─── program_days table ──────────────────────────────────────

    describe('program_days', () => {
      it('User A can read own program days', async () => {
        const { data, error } = await clientA
          .from('program_days')
          .select('id')
          .eq('id', programDayId)
          .single()
        expect(error).toBeNull()
        expect(data?.id).toBe(programDayId)
      })

      it('User B cannot read User A program days', async () => {
        const { data } = await clientB
          .from('program_days')
          .select('id')
          .eq('id', programDayId)
        expect(data).toEqual([])
      })

      it('User B cannot insert with User A user_id', async () => {
        const { error } = await clientB
          .from('program_days')
          .insert({
            user_id: userAId,
            program_id: programId,
            day_number: 2,
            name: 'Stolen Day',
          })
        expect(error).not.toBeNull()
      })

      it('User B cannot update User A program days', async () => {
        const { data } = await clientB
          .from('program_days')
          .update({ name: 'hacked' })
          .eq('id', programDayId)
          .select()
        expect(data).toEqual([])
      })

      it('User B cannot delete User A program days', async () => {
        const { data } = await clientB
          .from('program_days')
          .delete()
          .eq('id', programDayId)
          .select()
        expect(data).toEqual([])
      })
    })

    // ─── program_exercises table ─────────────────────────────────

    describe('program_exercises', () => {
      it('User A can read own program exercises', async () => {
        const { data, error } = await clientA
          .from('program_exercises')
          .select('id')
          .eq('id', programExerciseId)
          .single()
        expect(error).toBeNull()
        expect(data?.id).toBe(programExerciseId)
      })

      it('User B cannot read User A program exercises', async () => {
        const { data } = await clientB
          .from('program_exercises')
          .select('id')
          .eq('id', programExerciseId)
        expect(data).toEqual([])
      })

      it('User B cannot insert with User A user_id', async () => {
        const { error } = await clientB
          .from('program_exercises')
          .insert({
            user_id: userAId,
            program_day_id: programDayId,
            exercise_id: exerciseId,
            order: 1,
            sets_target: 3,
            reps_target: 10,
          })
        expect(error).not.toBeNull()
      })

      it('User B cannot update User A program exercises', async () => {
        const { data } = await clientB
          .from('program_exercises')
          .update({ sets_target: 99 })
          .eq('id', programExerciseId)
          .select()
        expect(data).toEqual([])
      })

      it('User B cannot delete User A program exercises', async () => {
        const { data } = await clientB
          .from('program_exercises')
          .delete()
          .eq('id', programExerciseId)
          .select()
        expect(data).toEqual([])
      })
    })

    // ─── workout_sessions table ──────────────────────────────────

    describe('workout_sessions', () => {
      it('User A can read own sessions', async () => {
        const { data, error } = await clientA
          .from('workout_sessions')
          .select('id')
          .eq('id', sessionId)
          .single()
        expect(error).toBeNull()
        expect(data?.id).toBe(sessionId)
      })

      it('User B cannot read User A sessions', async () => {
        const { data } = await clientB
          .from('workout_sessions')
          .select('id')
          .eq('id', sessionId)
        expect(data).toEqual([])
      })

      it('User B cannot insert with User A user_id', async () => {
        const { error } = await clientB
          .from('workout_sessions')
          .insert({
            user_id: userAId,
            started_at: new Date().toISOString(),
          })
        expect(error).not.toBeNull()
      })

      it('User B cannot update User A sessions', async () => {
        const { data } = await clientB
          .from('workout_sessions')
          .update({ notes: 'hacked' })
          .eq('id', sessionId)
          .select()
        expect(data).toEqual([])
      })

      it('User B cannot delete User A sessions', async () => {
        const { data } = await clientB
          .from('workout_sessions')
          .delete()
          .eq('id', sessionId)
          .select()
        expect(data).toEqual([])
      })
    })

    // ─── workout_sets table ──────────────────────────────────────

    describe('workout_sets', () => {
      it('User A can read own sets', async () => {
        const { data, error } = await clientA
          .from('workout_sets')
          .select('id')
          .eq('id', setId)
          .single()
        expect(error).toBeNull()
        expect(data?.id).toBe(setId)
      })

      it('User B cannot read User A sets', async () => {
        const { data } = await clientB
          .from('workout_sets')
          .select('id')
          .eq('id', setId)
        expect(data).toEqual([])
      })

      it('User B cannot insert with User A user_id', async () => {
        const { error } = await clientB
          .from('workout_sets')
          .insert({
            user_id: userAId,
            session_id: sessionId,
            exercise_id: exerciseId,
            set_number: 2,
            weight_kg: 70,
            reps: 8,
            is_warmup: false,
          })
        expect(error).not.toBeNull()
      })

      it('User B cannot update User A sets', async () => {
        const { data } = await clientB
          .from('workout_sets')
          .update({ weight_kg: 999 })
          .eq('id', setId)
          .select()
        expect(data).toEqual([])
      })

      it('User B cannot delete User A sets', async () => {
        const { data } = await clientB
          .from('workout_sets')
          .delete()
          .eq('id', setId)
          .select()
        expect(data).toEqual([])
      })
    })

    // ─── exercises table (permission boundary) ───────────────────

    describe('exercises (permission boundary)', () => {
      it('User A can read exercises', async () => {
        const { data, error } = await clientA
          .from('exercises')
          .select('id')
          .limit(1)
        expect(error).toBeNull()
        expect(data!.length).toBeGreaterThan(0)
      })

      it('User B can read exercises', async () => {
        const { data, error } = await clientB
          .from('exercises')
          .select('id')
          .limit(1)
        expect(error).toBeNull()
        expect(data!.length).toBeGreaterThan(0)
      })

      it('User A cannot insert exercises', async () => {
        const { error } = await clientA.from('exercises').insert({
          name_en: 'Hacked Exercise',
          name_fr: 'Exercice Piraté',
          muscle_primary: 'chest',
          equipment: 'barbell',
          difficulty: 'beginner',
        })
        expect(error).not.toBeNull()
      })

      it('User A cannot delete exercises', async () => {
        const { data } = await clientA
          .from('exercises')
          .delete()
          .eq('id', exerciseId)
          .select()
        expect(data).toEqual([])
      })
    })
  }
)
