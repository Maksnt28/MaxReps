import { Pressable, TouchableOpacity } from 'react-native'
import { XStack, YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useReorderableDrag, useIsActive } from 'react-native-reorderable-list'

import type { ProgramExerciseWithExercise } from '@/hooks/usePrograms'
import { getLocalizedExercise } from '@/lib/exercises'
import { AppCard } from '@/components/ui/AppCard'
import { AppText } from '@/components/ui/AppText'
import { colors } from '@/lib/theme'

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
    <YStack
      paddingHorizontal={12}
      paddingVertical={4}
      opacity={isActive ? 0.8 : 1}
    >
      <AppCard
        onPress={onPress}
        accessibilityLabel={`${name}, ${targetsText}`}
        accessibilityRole="button"
        variant="interactive"
        compact
      >
        <XStack gap={8} alignItems="center">
          <Pressable
            onLongPress={drag}
            delayLongPress={150}
            accessibilityLabel={t('programs.reorderExercise')}
            hitSlop={4}
          >
            <Ionicons name="reorder-three-outline" size={24} color={colors.gray6} />
          </Pressable>
          <YStack gap={2} flex={1}>
            <AppText preset="exerciseName" numberOfLines={1}>
              {name}
            </AppText>
            <XStack gap={8} alignItems="center">
              <AppText preset="lastSession" color={colors.gray8}>
                {targetsText}
              </AppText>
              {extras.length > 0 && (
                <>
                  <AppText preset="caption" color={colors.gray6}>·</AppText>
                  <AppText preset="caption" color={colors.gray8}>
                    {extras.join(' · ')}
                  </AppText>
                </>
              )}
            </XStack>
          </YStack>
          <TouchableOpacity
            onPress={onRemove}
            accessibilityLabel={t('programs.removeExercise')}
            hitSlop={6}
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.gray6} />
          </TouchableOpacity>
        </XStack>
      </AppCard>
    </YStack>
  )
}
