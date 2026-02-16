import { useMemo } from 'react'

import { useExerciseHistory } from './useWorkoutHistory'
import { useExercises } from './useExercises'
import { computeOverloadSuggestion, type OverloadSuggestion } from '@/lib/overload'

export function useOverloadSuggestion(
  exerciseId: string,
  currentSessionId: string | null,
  repsTarget: number | null
): { suggestion: OverloadSuggestion | null; isLoading: boolean } {
  const { data: history, isLoading: historyLoading } = useExerciseHistory(
    exerciseId,
    currentSessionId ?? undefined
  )
  const { data: exercises } = useExercises()

  const musclePrimary = useMemo(() => {
    const exercise = exercises?.find((e) => e.id === exerciseId)
    return exercise?.muscle_primary ?? ''
  }, [exercises, exerciseId])

  const suggestion = useMemo(() => {
    if (!history || history.length < 2 || !musclePrimary) return null
    return computeOverloadSuggestion(history, repsTarget, musclePrimary)
  }, [history, repsTarget, musclePrimary])

  return { suggestion, isLoading: historyLoading }
}
