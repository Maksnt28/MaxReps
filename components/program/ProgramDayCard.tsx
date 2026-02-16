import { Pressable, TouchableOpacity } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import type { ProgramDayWithExercises } from '@/hooks/usePrograms'

interface ProgramDayCardProps {
  day: ProgramDayWithExercises
  onPress: () => void
  onStartWorkout: () => void
  startWorkoutDisabled?: boolean
}

export const PROGRAM_DAY_CARD_HEIGHT = 88

export function ProgramDayCard({
  day,
  onPress,
  onStartWorkout,
  startWorkoutDisabled,
}: ProgramDayCardProps) {
  const { t } = useTranslation()
  const exerciseCount = day.program_exercises.length

  return (
    <XStack
      height={PROGRAM_DAY_CARD_HEIGHT}
      alignItems="center"
      paddingHorizontal="$3"
      gap="$3"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <Pressable
        onPress={onPress}
        accessibilityLabel={day.name}
        accessibilityRole="button"
        style={{ flex: 1, height: PROGRAM_DAY_CARD_HEIGHT, justifyContent: 'center' }}
      >
        <YStack gap="$1">
          <Text color="$color" fontSize={16} fontWeight="500" numberOfLines={1}>
            {day.name}
          </Text>
          <XStack gap="$2" alignItems="center">
            {day.focus && (
              <>
                <Text color="$gray10" fontSize={12} numberOfLines={1}>
                  {day.focus}
                </Text>
                <Text color="$gray10" fontSize={10}>{'·'}</Text>
              </>
            )}
            <Text color="$gray10" fontSize={12}>
              {t('programs.exerciseCount', { count: exerciseCount })}
            </Text>
          </XStack>
        </YStack>
      </Pressable>
      <TouchableOpacity
        onPress={onStartWorkout}
        disabled={startWorkoutDisabled}
        accessibilityLabel={t('programs.startWorkout')}
        accessibilityRole="button"
        hitSlop={8}
        style={{ opacity: startWorkoutDisabled ? 0.4 : 1 }}
      >
        <YStack
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor="$green10"
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name="play" size={20} color="#fff" />
        </YStack>
      </TouchableOpacity>
    </XStack>
  )
}
