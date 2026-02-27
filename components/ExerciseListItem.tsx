import { XStack, YStack } from 'tamagui'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTranslation } from 'react-i18next'

import type { Exercise } from '@/hooks/useExercises'
import { getLocalizedExercise } from '@/lib/exercises'
import { AppCard } from '@/components/ui/AppCard'
import { AppText } from '@/components/ui/AppText'
import { colors } from '@/lib/theme'

const MUSCLE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  chest: 'body-outline',
  back: 'body-outline',
  shoulders: 'body-outline',
  traps: 'arrow-up-outline',
  biceps: 'fitness-outline',
  triceps: 'fitness-outline',
  forearms: 'hand-left-outline',
  quads: 'walk-outline',
  hamstrings: 'walk-outline',
  glutes: 'walk-outline',
  calves: 'walk-outline',
  abs: 'body-outline',
}

function getMuscleIcon(muscle: string): keyof typeof Ionicons.glyphMap {
  return MUSCLE_ICONS[muscle] ?? 'barbell-outline'
}

interface ExerciseListItemProps {
  exercise: Exercise
  locale: string
  onPress: () => void
}

export const EXERCISE_LIST_ITEM_HEIGHT = 72

export function ExerciseListItem({
  exercise,
  locale,
  onPress,
}: ExerciseListItemProps) {
  const { t } = useTranslation()
  const { name } = getLocalizedExercise(exercise, locale)

  const muscleLabel = t(`exercises.muscles.${exercise.muscle_primary}`)
  const equipmentLabel = t(`exercises.equipment.${exercise.equipment}`)

  return (
    <AppCard
      variant="interactive"
      compact
      onPress={onPress}
      accessibilityLabel={`${name}, ${muscleLabel}`}
      accessibilityRole="button"
    >
      <XStack alignItems="center" gap={12}>
        <YStack
          width={44}
          height={44}
          borderRadius={12}
          backgroundColor={colors.gray3}
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons
            name={getMuscleIcon(exercise.muscle_primary)}
            size={22}
            color={colors.gray7}
          />
        </YStack>
        <YStack flex={1} gap={2}>
          <AppText preset="exerciseName" numberOfLines={1}>
            {name}
          </AppText>
          <XStack gap={8} alignItems="center">
            <AppText preset="caption" color={colors.gray8}>
              {muscleLabel}
            </AppText>
            <AppText preset="caption" color={colors.gray6}>·</AppText>
            <AppText preset="caption" color={colors.gray8}>
              {equipmentLabel}
            </AppText>
          </XStack>
        </YStack>
        <Ionicons name="chevron-forward" size={18} color={colors.gray6} />
      </XStack>
    </AppCard>
  )
}
