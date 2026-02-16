import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

export type Program = Database['public']['Tables']['programs']['Row']
export type ProgramDay = Database['public']['Tables']['program_days']['Row']
export type ProgramExercise = Database['public']['Tables']['program_exercises']['Row']
type Exercise = Database['public']['Tables']['exercises']['Row']

export type ProgramExerciseWithExercise = ProgramExercise & { exercise: Exercise }
export type ProgramDayWithExercises = ProgramDay & {
  program_exercises: ProgramExerciseWithExercise[]
}
export type ProgramWithDays = Program & { program_days: ProgramDayWithExercises[] }

type ProgramListItem = Program & { program_days: { id: string }[] }

export function usePrograms() {
  return useQuery<ProgramListItem[]>({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*, program_days(id)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as ProgramListItem[]
    },
  })
}

export function useProgram(id: string) {
  return useQuery<ProgramWithDays | null>({
    queryKey: ['programs', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select(
          '*, program_days(*, program_exercises(*, exercise:exercises(*)))'
        )
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      // Sort days by day_number, exercises by order
      const program = data as ProgramWithDays
      program.program_days.sort((a, b) => a.day_number - b.day_number)
      for (const day of program.program_days) {
        day.program_exercises.sort((a, b) => a.order - b.order)
      }

      return program
    },
    enabled: !!id,
  })
}

export function useCreateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { name: string }) => {
      const { data, error } = await supabase
        .from('programs')
        .insert({ name: params.name, type: 'custom' })
        .select('id')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
    },
  })
}

export function useUpdateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { id: string; name?: string; is_active?: boolean }) => {
      const { id, ...updates } = params
      const { error } = await supabase
        .from('programs')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
      queryClient.invalidateQueries({ queryKey: ['programs', params.id] })
    },
  })
}

export function useDeleteProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
    },
  })
}

export function useUpsertProgramDay() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      id?: string
      programId: string
      name: string
      dayNumber: number
      focus?: string | null
    }) => {
      const { data, error } = await supabase
        .from('program_days')
        .upsert({
          ...(params.id ? { id: params.id } : {}),
          program_id: params.programId,
          name: params.name,
          day_number: params.dayNumber,
          focus: params.focus ?? null,
        })
        .select('id')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['programs'], exact: true })
      queryClient.invalidateQueries({ queryKey: ['programs', params.programId] })
    },
  })
}

export function useDeleteProgramDay() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { id: string; programId: string }) => {
      const { error } = await supabase
        .from('program_days')
        .delete()
        .eq('id', params.id)

      if (error) throw error
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['programs'], exact: true })
      queryClient.invalidateQueries({ queryKey: ['programs', params.programId] })
    },
  })
}

export function useAddProgramExercises() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      dayId: string
      programId: string
      exercises: { exerciseId: string; order: number }[]
    }) => {
      const rows = params.exercises.map((e) => ({
        program_day_id: params.dayId,
        exercise_id: e.exerciseId,
        order: e.order,
        sets_target: 3,
        reps_target: 10,
      }))

      const { error } = await supabase
        .from('program_exercises')
        .insert(rows)

      if (error) throw error
    },
    onSuccess: async (_, params) => {
      await queryClient.invalidateQueries({ queryKey: ['programs', params.programId] })
    },
  })
}

export function useUpdateProgramExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      id: string
      programId: string
      updates: {
        sets_target?: number
        reps_target?: number
        rpe_target?: number | null
        rest_seconds?: number | null
        notes?: string | null
      }
    }) => {
      const { error } = await supabase
        .from('program_exercises')
        .update(params.updates)
        .eq('id', params.id)

      if (error) throw error
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['programs', params.programId] })
    },
  })
}

export function useDeleteProgramExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { id: string; programId: string }) => {
      const { error } = await supabase
        .from('program_exercises')
        .delete()
        .eq('id', params.id)

      if (error) throw error
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['programs', params.programId] })
    },
  })
}

export function useReorderProgramExercises() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      programId: string
      exercises: { id: string; order: number }[]
    }) => {
      await Promise.all(
        params.exercises.map((e) =>
          supabase
            .from('program_exercises')
            .update({ order: e.order })
            .eq('id', e.id)
            .then(({ error }) => {
              if (error) throw error
            })
        )
      )
    },
    onMutate: async (params) => {
      const queryKey = ['programs', params.programId]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<ProgramWithDays>(queryKey)

      if (previous) {
        const orderMap = new Map(params.exercises.map((e) => [e.id, e.order]))
        queryClient.setQueryData<ProgramWithDays>(queryKey, {
          ...previous,
          program_days: previous.program_days.map((day) => ({
            ...day,
            program_exercises: [...day.program_exercises]
              .map((pe) => ({
                ...pe,
                order: orderMap.get(pe.id) ?? pe.order,
              }))
              .sort((a, b) => a.order - b.order),
          })),
        })
      }

      return { previous }
    },
    onError: (_error, params, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['programs', params.programId], context.previous)
      }
    },
    onSettled: (_, _error, params) => {
      queryClient.invalidateQueries({ queryKey: ['programs', params.programId] })
    },
  })
}
