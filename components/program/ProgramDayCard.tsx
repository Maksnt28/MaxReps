import { Pressable, TouchableOpacity } from 'react-native'
import { XStack, YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import type { ProgramDayWithExercises } from '@/hooks/usePrograms'
import { AppCard } from '@/components/ui/AppCard'
import { AppText } from '@/components/ui/AppText'
import { colors } from '@/lib/theme'

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
    <AppCard variant="interactive">
      <XStack alignItems="center" gap={12}>
        <Pressable
          onPress={onPress}
          accessibilityLabel={day.name}
          accessibilityRole="button"
          style={{ flex: 1 }}
        >
          <YStack gap={4}>
            <AppText preset="exerciseName" numberOfLines={1}>
              {day.name}
            </AppText>
            <XStack gap={8} alignItems="center">
              {day.focus && (
                <>
                  <AppText preset="caption" color={colors.gray8} numberOfLines={1}>
                    {day.focus}
                  </AppText>
                  <AppText preset="caption" color={colors.gray6}>·</AppText>
                </>
              )}
              <AppText preset="caption" color={colors.gray8}>
                {t('programs.exerciseCount', { count: exerciseCount })}
              </AppText>
            </XStack>
          </YStack>
        </Pressable>
        <TouchableOpacity
          onPress={onStartWorkout}
          disabled={startWorkoutDisabled}
          accessibilityLabel={t('programs.startWorkout')}
          accessibilityRole="button"
          accessibilityState={{ disabled: !!startWorkoutDisabled }}
          hitSlop={8}
          style={{ opacity: startWorkoutDisabled ? 0.4 : 1 }}
        >
          <YStack
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={colors.accent}
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons name="play" size={20} color="#fff" />
          </YStack>
        </TouchableOpacity>
      </XStack>
    </AppCard>
  )
}
