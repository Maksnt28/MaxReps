import { Pressable, TouchableOpacity } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useReorderableDrag, useIsActive } from 'react-native-reorderable-list'

import type { ProgramExerciseWithExercise } from '@/hooks/usePrograms'
import { getLocalizedExercise } from '@/lib/exercises'

interface ProgramExerciseRowProps {
  exercise: ProgramExerciseWithExercise
  locale: string
  onPress: () => void
  onRemove: () => void
}

export function ProgramExerciseRow({
  exercise,
  locale,
  onPress,
  onRemove,
}: ProgramExerciseRowProps) {
  const { t } = useTranslation()
  const { name } = getLocalizedExercise(exercise.exercise, locale)
  const drag = useReorderableDrag()
  const isActive = useIsActive()

  const targetsText = `${exercise.sets_target}\u00D7${exercise.reps_target}`
  const extras: string[] = []
  if (exercise.rpe_target != null) {
    extras.push(`RPE ${exercise.rpe_target}`)
  }
  if (exercise.rest_seconds != null) {
    extras.push(`${exercise.rest_seconds}s`)
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${name}, ${targetsText}`}
      accessibilityRole="button"
    >
      <XStack
        paddingVertical="$3"
        paddingHorizontal="$3"
        gap="$2"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        opacity={isActive ? 0.8 : 1}
        backgroundColor={isActive ? '$backgroundHover' : undefined}
      >
        <Pressable
          onLongPress={drag}
          delayLongPress={150}
          accessibilityLabel={t('programs.reorderExercise')}
          hitSlop={4}
        >
          <Ionicons name="reorder-three-outline" size={24} color="#888" />
        </Pressable>
        <YStack gap="$0.5" flex={1}>
          <Text color="$color" fontSize={15} fontWeight="500" numberOfLines={1}>
            {name}
          </Text>
          <XStack gap="$2" alignItems="center">
            <Text color="$gray10" fontSize={13} fontWeight="600">
              {targetsText}
            </Text>
            {extras.length > 0 && (
              <>
                <Text color="$gray10" fontSize={10}>
                  {'\u00B7'}
                </Text>
                <Text color="$gray10" fontSize={12}>
                  {extras.join(' \u00B7 ')}
                </Text>
              </>
            )}
          </XStack>
        </YStack>
        <TouchableOpacity
          onPress={onRemove}
          accessibilityLabel={t('programs.removeExercise')}
          hitSlop={6}
        >
          <Ionicons name="close-circle-outline" size={20} color="#888" />
        </TouchableOpacity>
      </XStack>
    </Pressable>
  )
}
