import { useState } from 'react'
import { Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack, XStack } from 'tamagui'
import { useTranslation } from 'react-i18next'

import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { useRestTimerStore } from '@/stores/useRestTimerStore'
import { useFinishWorkout, useDiscardWorkout } from '@/hooks/useWorkoutMutations'
import { hapticHeavy } from '@/lib/animations'
import { colors } from '@/lib/theme'
import type { PRSummaryItem } from '@/lib/types'
import { AppText } from '@/components/ui/AppText'
import { StartWorkoutButton } from '@/components/workout/StartWorkoutButton'
import { ActiveWorkoutScreen } from '@/components/workout/ActiveWorkoutScreen'
import { WorkoutSummary } from '@/components/workout/WorkoutSummary'
import { WorkoutHistoryList } from '@/components/workout/WorkoutHistoryList'

interface SummaryData {
  durationSeconds: number
  exerciseCount: number
  setsCount: number
  totalVolumeKg: number
  prs: PRSummaryItem[]
}

export default function WorkoutScreen() {
  const { t } = useTranslation()
  const { isActive, sessionId, startedAt, exercises, notes, endWorkout } =
    useWorkoutStore()
  const finishWorkout = useFinishWorkout()
  const discardWorkout = useDiscardWorkout()
  const resetTimer = useRestTimerStore((s) => s.reset)
  const [summary, setSummary] = useState<SummaryData | null>(null)

  function handleFinish(prData?: PRSummaryItem[]) {
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
              resetTimer()
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
                prs: prData ?? [],
              })
            } catch {
              Alert.alert(t('common.error'), t('workout.saveError'))
            }
          },
        },
      ],
    )
  }

  function handleDiscard() {
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
            resetTimer()
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
        prs={summary.prs}
        onDone={() => {
          setSummary(null)
          endWorkout()
          resetTimer()
        }}
      />
    )
  }

  if (!isActive) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
        <YStack flex={1}>
          <XStack paddingHorizontal={16} paddingTop={16} paddingBottom={8}>
            <AppText fontSize={28} fontWeight="800" color={colors.gray12}>
              {t('tabs.workout')}
            </AppText>
          </XStack>

          <YStack paddingHorizontal={16}>
            <StartWorkoutButton />
          </YStack>

          <YStack flex={1}>
            <WorkoutHistoryList />
          </YStack>
        </YStack>
      </SafeAreaView>
    )
  }

  return <ActiveWorkoutScreen onFinish={handleFinish} onDiscard={handleDiscard} />
}
