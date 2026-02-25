import { useEffect, useMemo, useState } from 'react'
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { useKeepAwake } from 'expo-keep-awake'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack, XStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { LinearGradient } from 'expo-linear-gradient'

import { useWorkoutStore } from '@/stores/useWorkoutStore'
import type { ActiveExercise } from '@/stores/useWorkoutStore'
import { useRestTimerStore } from '@/stores/useRestTimerStore'
import { useExercises } from '@/hooks/useExercises'
import { getLocalizedExercise } from '@/lib/exercises'
import { useRealtimePR } from '@/hooks/useRealtimePR'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { colors, backgroundGradient, spacing } from '@/lib/theme'
import type { PRSummaryItem } from '@/lib/types'
import { WorkoutHeader } from './WorkoutHeader'
import { ExerciseCard } from './ExerciseCard'
import { RestTimerBandeau } from './RestTimerBandeau'
import { FullScreenTimer } from './FullScreenTimer'
import { MomentumBar } from './MomentumBar'

interface ActiveWorkoutScreenProps {
  onFinish: (prData?: PRSummaryItem[]) => void
}

function ProgressDots({ exercises }: { exercises: ActiveExercise[] }) {
  return (
    <XStack gap={3} paddingHorizontal={spacing.screenPaddingH} paddingVertical={6}>
      {exercises.map((ae) => {
        const allDone = ae.sets.filter((s) => !s.isWarmup).every((s) => s.isCompleted)
        const hasSomeCompleted = ae.sets.some((s) => !s.isWarmup && s.isCompleted)
        return (
          <YStack
            key={ae.exerciseId}
            flex={1}
            height={3}
            borderRadius={1.5}
            backgroundColor={
              allDone
                ? colors.accent
                : hasSomeCompleted
                  ? 'rgba(59,130,246,0.6)'
                  : 'rgba(128,128,128,0.15)'
            }
          />
        )
      })}
    </XStack>
  )
}

export function ActiveWorkoutScreen({ onFinish }: ActiveWorkoutScreenProps) {
  useKeepAwake()
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const locale = i18n.language

  const exercises = useWorkoutStore((s) => s.exercises)
  const startedAt = useWorkoutStore((s) => s.startedAt)
  const isTimerRunning = useRestTimerStore((s) => s.isRunning)
  const { data: allExercises } = useExercises()

  const [isTimerExpanded, setIsTimerExpanded] = useState(false)

  // Auto-collapse when timer stops (single source of truth for collapse)
  useEffect(() => {
    if (!isTimerRunning) setIsTimerExpanded(false)
  }, [isTimerRunning])

  const exerciseMap = useMemo(() => {
    const map = new Map<string, NonNullable<typeof allExercises>[number]>()
    allExercises?.forEach((e) => map.set(e.id, e))
    return map
  }, [allExercises])

  const exerciseIds = useMemo(
    () => exercises.map((e) => e.exerciseId),
    [exercises]
  )

  const sessionId = useWorkoutStore((s) => s.sessionId)
  const prStates = useRealtimePR(exerciseIds, sessionId, exercises)

  // Set progress for contextual CTA
  const { completedWorkingSets, totalWorkingSets } = useMemo(() => {
    let completed = 0
    let total = 0
    for (const e of exercises) {
      for (const s of e.sets) {
        if (s.isWarmup) continue
        total++
        if (s.isCompleted) completed++
      }
    }
    return { completedWorkingSets: completed, totalWorkingSets: total }
  }, [exercises])

  const allWorkingDone = totalWorkingSets > 0 && completedWorkingSets === totalWorkingSets

  // Snapshot PR data for passing to onFinish
  const prData = useMemo<PRSummaryItem[]>(() => {
    const items: PRSummaryItem[] = []
    for (const [exId, state] of prStates) {
      if (!state?.isPR) continue
      const ex = exerciseMap.get(exId)
      const name = ex ? getLocalizedExercise(ex, locale).name : exId
      items.push({
        exerciseName: name,
        weight: state.newMax,
        previousMax: state.previousMax,
        delta: state.delta,
      })
    }
    return items
  }, [prStates, exerciseMap, locale])

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <LinearGradient
        colors={[...backgroundGradient.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1}>
          {startedAt && <WorkoutHeader startedAt={startedAt} onFinish={onFinish} />}

          {exercises.length > 0 && <ProgressDots exercises={exercises} />}
          {exercises.length > 0 && <MomentumBar exerciseIds={exerciseIds} />}

          {isTimerRunning && !isTimerExpanded && (
            <RestTimerBandeau onExpand={() => setIsTimerExpanded(true)} />
          )}

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.screenPaddingH,
              paddingBottom: 200,
              gap: spacing.cardGap,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {exercises.length === 0 ? (
              <YStack alignItems="center" justifyContent="center" paddingVertical={80} gap={12}>
                <Ionicons name="barbell-outline" size={48} color={colors.gray6} />
                <AppText preset="body" color={colors.gray8}>
                  {t('workout.noExercises')}
                </AppText>
                <AppText preset="caption" color={colors.gray7} textAlign="center">
                  {t('workout.noExercisesMessage')}
                </AppText>
              </YStack>
            ) : (
              exercises.map((ae) => (
                <ExerciseCard
                  key={ae.exerciseId}
                  activeExercise={ae}
                  exercise={exerciseMap.get(ae.exerciseId)}
                  locale={locale}
                  prState={prStates.get(ae.exerciseId)}
                />
              ))
            )}
          </ScrollView>

          {/* Bottom action bar */}
          <YStack
            position="absolute"
            bottom={85}
            left={0}
            right={0}
            paddingHorizontal={spacing.screenPaddingH}
            paddingVertical={12}
            gap={8}
          >
            <AppButton
              variant="primary"
              icon="add"
              fullWidth
              onPress={() => router.push('/workout/add-exercise')}
              accessibilityLabel={t('workout.addExercise')}
            >
              {t('workout.addExercise')}
            </AppButton>
            {exercises.length > 0 ? (
              <AppButton
                variant="secondary"
                icon="checkmark-done"
                fullWidth
                onPress={() => onFinish(prData)}
                accessibilityLabel={allWorkingDone ? t('workout.finishWorkoutCta') : t('workout.finishProgress', { current: completedWorkingSets, total: totalWorkingSets })}
              >
                {allWorkingDone
                  ? t('workout.finishWorkoutCta')
                  : t('workout.finishProgress', { current: completedWorkingSets, total: totalWorkingSets })}
              </AppButton>
            ) : (
              <AppButton
                variant="destructive"
                icon="close"
                fullWidth
                onPress={onFinish}
                accessibilityLabel={t('workout.discardWorkout')}
              >
                {t('workout.discardWorkout')}
              </AppButton>
            )}
          </YStack>
        </YStack>
      </SafeAreaView>

      {/* Full-screen timer overlay */}
      {isTimerExpanded && isTimerRunning && (
        <FullScreenTimer onCollapse={() => setIsTimerExpanded(false)} />
      )}
    </KeyboardAvoidingView>
  )
}
