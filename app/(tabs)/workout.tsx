import { useState } from 'react'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { useFinishWorkout, useDiscardWorkout } from '@/hooks/useWorkoutMutations'
import { hapticHeavy } from '@/lib/animations'
import { StartWorkoutButton } from '@/components/workout/StartWorkoutButton'
import { ActiveWorkoutScreen } from '@/components/workout/ActiveWorkoutScreen'
import { WorkoutSummary } from '@/components/workout/WorkoutSummary'

interface SummaryData {
  durationSeconds: number
  exerciseCount: number
  setsCount: number
  totalVolumeKg: number
}

export default function WorkoutScreen() {
  const { t } = useTranslation()
  const { isActive, sessionId, startedAt, exercises, notes, endWorkout } =
    useWorkoutStore()
  const finishWorkout = useFinishWorkout()
  const discardWorkout = useDiscardWorkout()
  const [summary, setSummary] = useState<SummaryData | null>(null)

  function handleFinish() {
    const completedSets = exercises.flatMap((e) =>
      e.sets.filter((s) => s.isCompleted)
    )

    if (completedSets.length === 0) {
      // No completed sets — offer to discard
      Alert.alert(
        t('workout.discardWorkout'),
        t('workout.discardConfirm'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.confirm'),
            style: 'destructive',
            onPress: async () => {
              if (sessionId) {
                try {
                  await discardWorkout.mutateAsync(sessionId)
                } catch {
                  // Session cleanup failed — still clear local state
                }
              }
              endWorkout()
            },
          },
        ],
      )
      return
    }

    // Has completed sets — confirm finish
    Alert.alert(
      t('workout.finishConfirm'),
      `${exercises.length} ${t('workout.summary.exercises').toLowerCase()}, ${completedSets.length} ${t('workout.summary.sets').toLowerCase()}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('workout.finishWorkout'),
          onPress: async () => {
            if (!sessionId || !startedAt) return
            try {
              const result = await finishWorkout.mutateAsync({
                sessionId,
                startedAt,
                exercises,
                notes,
              })

              const totalVolumeKg = completedSets
                .filter((s) => !s.isWarmup)
                .reduce((sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0), 0)

              hapticHeavy()
              setSummary({
                durationSeconds: result.durationSeconds,
                exerciseCount: exercises.length,
                setsCount: result.setsCount,
                totalVolumeKg,
              })
            } catch {
              Alert.alert(t('common.error'), t('workout.saveError'))
            }
          },
        },
      ],
    )
  }

  // Show summary after finishing
  if (summary) {
    return (
      <WorkoutSummary
        durationSeconds={summary.durationSeconds}
        exerciseCount={summary.exerciseCount}
        setsCount={summary.setsCount}
        totalVolumeKg={summary.totalVolumeKg}
        onDone={() => {
          setSummary(null)
          endWorkout()
        }}
      />
    )
  }

  if (!isActive) {
    return <StartWorkoutButton />
  }

  return <ActiveWorkoutScreen onFinish={handleFinish} />
}
