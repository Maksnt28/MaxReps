import { XStack, YStack, Text } from 'tamagui'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'

import type { Exercise } from '@/hooks/useExercises'
import { getLocalizedExercise } from '@/lib/exercises'

const MUSCLE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  chest: 'body-outline',
  back: 'body-outline',
  shoulders: 'body-outline',
  biceps: 'arm-left-outline' as keyof typeof Ionicons.glyphMap,
  triceps: 'arm-left-outline' as keyof typeof Ionicons.glyphMap,
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
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${name}, ${muscleLabel}`}
      accessibilityRole="button"
    >
      <XStack
        height={EXERCISE_LIST_ITEM_HEIGHT}
        alignItems="center"
        paddingHorizontal="$3"
        gap="$3"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <YStack
          width={44}
          height={44}
          borderRadius="$3"
          backgroundColor="$backgroundHover"
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons
            name={getMuscleIcon(exercise.muscle_primary)}
            size={22}
            color="#888"
          />
        </YStack>
        <YStack flex={1} gap="$1">
          <Text color="$color" fontSize={16} fontWeight="500" numberOfLines={1}>
            {name}
          </Text>
          <XStack gap="$2" alignItems="center">
            <Text color="$gray10" fontSize={12}>
              {muscleLabel}
            </Text>
            <Text color="$gray10" fontSize={10}>
              {'·'}
            </Text>
            <Text color="$gray10" fontSize={12}>
              {equipmentLabel}
            </Text>
          </XStack>
        </YStack>
        <Ionicons name="chevron-forward" size={18} color="#555" />
      </XStack>
    </Pressable>
  )
}
