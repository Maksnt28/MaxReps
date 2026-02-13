import { Alert } from 'react-native'
import { YStack, XStack, Text, Button } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import type { Exercise } from '@/hooks/useExercises'
import type { ActiveExercise } from '@/stores/useWorkoutStore'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { getLocalizedExercise } from '@/lib/exercises'
import { SetRow } from './SetRow'

interface ExerciseCardProps {
  activeExercise: ActiveExercise
  exercise: Exercise | undefined
  locale: string
}

export function ExerciseCard({ activeExercise, exercise, locale }: ExerciseCardProps) {
  const { t } = useTranslation()
  const { addSet, updateSet, completeSet, toggleWarmup, removeExercise } =
    useWorkoutStore()

  const exerciseId = activeExercise.exerciseId
  const name = exercise ? getLocalizedExercise(exercise, locale).name : exerciseId

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
      </XStack>

      {/* Set rows */}
      {activeExercise.sets.map((s) => (
        <SetRow
          key={s.id}
          set={s}
          onUpdate={(updates) => updateSet(exerciseId, s.id, updates)}
          onComplete={() => completeSet(exerciseId, s.id)}
          onToggleWarmup={() => toggleWarmup(exerciseId, s.id)}
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
