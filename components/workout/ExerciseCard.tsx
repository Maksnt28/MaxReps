import { useEffect, useRef } from 'react'
import { Alert, Pressable } from 'react-native'
import { YStack, XStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import type { Exercise } from '@/hooks/useExercises'
import type { ActiveExercise } from '@/stores/useWorkoutStore'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { useRestTimerStore, DEFAULT_REST_SECONDS } from '@/stores/useRestTimerStore'
import { useUserStore } from '@/stores/useUserStore'
import { useOverloadSuggestion } from '@/hooks/useOverloadSuggestion'
import { getLocalizedExercise } from '@/lib/exercises'
import { getWeightIncrement } from '@/lib/overload'
import { AppCard } from '@/components/ui/AppCard'
import { AppText } from '@/components/ui/AppText'
import { Divider } from '@/components/ui/Divider'
import { colors } from '@/lib/theme'
import { SetRow } from './SetRow'

interface ExerciseCardProps {
  activeExercise: ActiveExercise
  exercise: Exercise | undefined
  locale: string
}

export function ExerciseCard({ activeExercise, exercise, locale }: ExerciseCardProps) {
  const { t } = useTranslation()
  const { addSet, updateSet, removeSet, completeSet, toggleWarmup, removeExercise } =
    useWorkoutStore()
  const startTimer = useRestTimerStore((s) => s.startTimer)
  const skipTimer = useRestTimerStore((s) => s.skip)

  const isTimerDisabled = useRestTimerStore((s) => s.disabledExerciseIds.includes(activeExercise.exerciseId))
  const toggleTimer = useRestTimerStore((s) => s.toggleTimerForExercise)

  const exerciseId = activeExercise.exerciseId
  const sessionId = useWorkoutStore((s) => s.sessionId)
  const name = exercise ? getLocalizedExercise(exercise, locale).name : exerciseId

  const { suggestion } = useOverloadSuggestion(
    exerciseId,
    sessionId,
    activeExercise.repsTarget
  )

  // Pre-fill first empty working set once per exercise
  const preFilled = useRef(false)
  useEffect(() => {
    if (preFilled.current || !suggestion) return
    const firstEmpty = activeExercise.sets.find(
      (s) => !s.isWarmup && !s.isCompleted && s.weightKg == null
    )
    if (firstEmpty) {
      updateSet(exerciseId, firstEmpty.id, {
        weightKg: suggestion.weight,
        reps: firstEmpty.reps ?? suggestion.reps,
      })
      preFilled.current = true
    }
  }, [suggestion, activeExercise.sets, exerciseId, updateSet])

  // Find first incomplete non-warmup set to show indicator
  const indicatorSetId = (() => {
    if (!suggestion) return null
    const target = activeExercise.sets.find(
      (s) => !s.isWarmup && !s.isCompleted
    )
    if (!target || target.weightKg == null) return null
    if (Math.abs(target.weightKg - suggestion.weight) < 0.01) return target.id
    return null
  })()

  // Find first incomplete non-warmup set (current set)
  const currentSetId = activeExercise.sets.find(
    (s) => !s.isWarmup && !s.isCompleted
  )?.id ?? null

  const increment = exercise?.muscle_primary
    ? getWeightIncrement(exercise.muscle_primary)
    : 2.5

  const muscleLabel = exercise
    ? t(`exercises.muscles.${exercise.muscle_primary}`)
    : ''

  // Find done/todo separator index
  const lastCompletedIdx = (() => {
    let idx = -1
    activeExercise.sets.forEach((s, i) => {
      if (s.isCompleted) idx = i
    })
    return idx
  })()
  const firstUpcomingIdx = activeExercise.sets.findIndex(
    (s, i) => i > lastCompletedIdx && !s.isCompleted
  )

  function handleCompleteSet(set: typeof activeExercise.sets[number]) {
    completeSet(exerciseId, set.id)
    const isDisabled = useRestTimerStore.getState().disabledExerciseIds.includes(exerciseId)
    if (!set.isCompleted && !set.isWarmup && !isDisabled) {
      const { defaultRestSeconds, restSecondsSuccess, restSecondsFailure } = useUserStore.getState()

      let restDuration: number
      let adaptiveFailure = false

      // Check adaptive failure first — failure rest overrides everything
      const adaptiveEnabled = restSecondsSuccess != null && restSecondsFailure != null
      const isFailure = adaptiveEnabled
        && activeExercise.repsTarget != null
        && set.reps != null
        && set.reps < activeExercise.repsTarget

      if (isFailure) {
        // Adaptive failure overrides per-exercise rest
        restDuration = restSecondsFailure!
        adaptiveFailure = true
      } else if (activeExercise.restSeconds != null) {
        // Per-exercise override for success / non-adaptive
        restDuration = activeExercise.restSeconds
      } else if (adaptiveEnabled) {
        // Adaptive success (no per-exercise override)
        restDuration = restSecondsSuccess!
      } else {
        restDuration = defaultRestSeconds ?? DEFAULT_REST_SECONDS
      }

      startTimer(exerciseId, restDuration)
      // Always set adaptive failure flag when adaptive mode is active (intent-based, not value-matching).
      // Must set to false on success too — otherwise a success timer replacing a running failure timer
      // mid-run would inherit the stale isAdaptiveFailure=true (expire()/skip() never fired to clear it).
      if (restSecondsSuccess != null && restSecondsFailure != null) {
        useRestTimerStore.setState({ isAdaptiveFailure: adaptiveFailure })
      }
    } else if (set.isCompleted && !set.isWarmup && useRestTimerStore.getState().isRunning) {
      // Uncompleting a working set while timer runs → cancel it
      skipTimer()
    }
  }

  function handleRemove() {
    Alert.alert(
      t('workout.removeExercise'),
      t('workout.removeExerciseConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => removeExercise(exerciseId),
        },
      ],
    )
  }

  return (
    <AppCard blur>
      {/* Header: exercise name + muscle chip + overflow */}
      <XStack alignItems="center" justifyContent="space-between" marginBottom={4}>
        <YStack flex={1} gap={2}>
          <AppText preset="exerciseName" numberOfLines={1} accessibilityRole="header">
            {name}
          </AppText>
          {muscleLabel ? (
            <AppText preset="caption" color={colors.gray7}>{muscleLabel}</AppText>
          ) : null}
        </YStack>
        <XStack gap={8} alignItems="center">
          <Pressable
            onPress={() => toggleTimer(exerciseId)}
            accessibilityLabel={isTimerDisabled ? t('workout.timerDisabled') : t('workout.timerEnabled')}
            hitSlop={8}
          >
            <Ionicons
              name={isTimerDisabled ? 'timer-outline' : 'timer'}
              size={18}
              color={isTimerDisabled ? colors.gray5 : colors.gray7}
            />
          </Pressable>
          <Pressable
            onPress={handleRemove}
            accessibilityLabel={t('workout.removeExercise')}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={18} color={colors.gray6} />
          </Pressable>
        </XStack>
      </XStack>

      {/* Column headers */}
      <XStack alignItems="center" gap={8} paddingHorizontal={8} marginBottom={2}>
        <XStack width={28} justifyContent="center">
          <AppText preset="columnHeader" color={colors.gray7}>
            #
          </AppText>
        </XStack>
        <AppText preset="columnHeader" color={colors.gray7} flex={1} textAlign="center">
          {t('workout.weight')}
        </AppText>
        <AppText preset="columnHeader" color={colors.gray7} flex={1} textAlign="center">
          {t('workout.reps')}
        </AppText>
        <AppText preset="columnHeader" color={colors.gray7} width={50} textAlign="center">
          {t('workout.rpe')}
        </AppText>
        <XStack width={28} />
        <XStack width={20} />
      </XStack>

      <Divider />

      {/* Set rows */}
      {activeExercise.sets.map((s, i) => (
        <YStack key={s.id}>
          {/* Done/todo separator */}
          {i === firstUpcomingIdx && lastCompletedIdx >= 0 && (
            <Divider variant="accent" marginVertical={4} />
          )}
          <SetRow
            set={s}
            isCurrent={s.id === currentSetId}
            onUpdate={(updates) => updateSet(exerciseId, s.id, updates)}
            onComplete={() => handleCompleteSet(s)}
            onToggleWarmup={() => toggleWarmup(exerciseId, s.id)}
            onRemove={() => removeSet(exerciseId, s.id)}
            suggestionType={s.id === indicatorSetId ? suggestion!.type : undefined}
            suggestionHint={
              s.id === indicatorSetId
                ? suggestion!.type === 'increase'
                  ? t('workout.overload.increase', { increment })
                  : t('workout.overload.deload')
                : undefined
            }
          />
        </YStack>
      ))}

      {/* Add set button */}
      <Pressable
        onPress={() => addSet(exerciseId)}
        accessibilityLabel={t('workout.addSet')}
        style={{ paddingVertical: 8 }}
      >
        <XStack alignItems="center" justifyContent="center" gap={6}>
          <Ionicons name="add-circle-outline" size={16} color={colors.gray7} />
          <AppText preset="caption" color={colors.gray7}>
            {t('workout.addSet')}
          </AppText>
        </XStack>
      </Pressable>
    </AppCard>
  )
}
