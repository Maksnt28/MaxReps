import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import { AppText } from '@/components/ui/AppText'
import { colors } from '@/lib/theme'
import { WorkoutTimer } from './WorkoutTimer'

interface WorkoutHeaderProps {
  startedAt: string
  onFinish: () => void
  onDiscard?: () => void
  programName?: string
  dayNumber?: number
}

export function WorkoutHeader({ startedAt, onFinish, onDiscard, programName, dayNumber }: WorkoutHeaderProps) {
  const { t } = useTranslation()

  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={16}
      paddingTop={16}
      paddingBottom={8}
    >
      <YStack flex={1}>
        <AppText fontSize={28} fontWeight="800" color={colors.gray12}>{t('workout.activeWorkout')}</AppText>
        {programName && dayNumber != null && (
          <AppText preset="caption" color={colors.gray7}>
            {t('workout.sessionSubtitle', { day: dayNumber, program: programName })}
          </AppText>
        )}
      </YStack>
      <XStack alignItems="center" gap={12}>
        <YStack alignItems="flex-end" gap={2}>
          <WorkoutTimer startedAt={startedAt} />
          <AppText preset="columnHeader" color={colors.gray7}>
            {t('workout.duration')}
          </AppText>
        </YStack>
        {onDiscard && (
          <Pressable
            onPress={onDiscard}
            hitSlop={8}
            accessibilityLabel={t('workout.discardWorkout')}
            style={{ padding: 4 }}
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.gray6} />
          </Pressable>
        )}
      </XStack>
    </XStack>
  )
}
