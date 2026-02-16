import { useEffect, useRef } from 'react'
import { Alert } from 'react-native'
import { YStack, XStack, Text, Button } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import type { Exercise } from '@/hooks/useExercises'
import type { ActiveExercise } from '@/stores/useWorkoutStore'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { useOverloadSuggestion } from '@/hooks/useOverloadSuggestion'
import { getLocalizedExercise } from '@/lib/exercises'
import { getWeightIncrement } from '@/lib/overload'
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

  const increment = exercise?.muscle_primary
    ? getWeightIncrement(exercise.muscle_primary)
    : 2.5

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
    <YStack
      backgroundColor="$backgroundHover"
      borderRadius="$4"
      padding="$3"
      gap="$2"
    >
      {/* Header: exercise name + remove */}
      <XStack alignItems="center" justifyContent="space-between">
        <Text
          color="$color"
          fontSize={17}
          fontWeight="600"
          flex={1}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {name}
        </Text>
        <Button
          size="$2"
          chromeless
          onPress={handleRemove}
          accessibilityLabel={t('workout.removeExercise')}
        >
          <Ionicons name="trash-outline" size={18} color="#888" />
        </Button>
      </XStack>

      {/* Column headers */}
      <XStack alignItems="center" gap="$2" paddingHorizontal="$2">
        <XStack width={32} justifyContent="center">
          <Text color="$gray10" fontSize={11} fontWeight="600">
            {t('workout.set')}
          </Text>
        </XStack>
        <Text flex={1} color="$gray10" fontSize={11} fontWeight="600" textAlign="center">
          {t('workout.weight')}
        </Text>
        <Text flex={1} color="$gray10" fontSize={11} fontWeight="600" textAlign="center">
          {t('workout.reps')}
        </Text>
        <Text width={56} color="$gray10" fontSize={11} fontWeight="600" textAlign="center">
          {t('workout.rpe')}
        </Text>
        <XStack width={28} />
        <XStack width={24} />
      </XStack>

      {/* Set rows */}
      {activeExercise.sets.map((s) => (
        <SetRow
          key={s.id}
          set={s}
          onUpdate={(updates) => updateSet(exerciseId, s.id, updates)}
          onComplete={() => completeSet(exerciseId, s.id)}
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
      ))}

      {/* Add set button */}
      <Button
        size="$3"
        chromeless
        onPress={() => addSet(exerciseId)}
        accessibilityLabel={t('workout.addSet')}
      >
        <XStack alignItems="center" gap="$1.5">
          <Ionicons name="add-circle-outline" size={18} color="#888" />
          <Text color="$gray10" fontSize={14}>
            {t('workout.addSet')}
          </Text>
        </XStack>
      </Button>
    </YStack>
  )
}
