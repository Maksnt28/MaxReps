import { XStack, YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/AppText'
import { colors } from '@/lib/theme'
import { WorkoutTimer } from './WorkoutTimer'

interface WorkoutHeaderProps {
  startedAt: string
  onFinish: () => void
  programName?: string
  dayNumber?: number
}

export function WorkoutHeader({ startedAt, onFinish, programName, dayNumber }: WorkoutHeaderProps) {
  const { t } = useTranslation()

  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={16}
      paddingTop={16}
      paddingBottom={8}
    >
      <YStack>
        <AppText fontSize={28} fontWeight="800" color={colors.gray12}>{t('workout.activeWorkout')}</AppText>
        {programName && dayNumber != null && (
          <AppText preset="caption" color={colors.gray7}>
            {t('workout.sessionSubtitle', { day: dayNumber, program: programName })}
          </AppText>
        )}
      </YStack>
      <YStack alignItems="flex-end" gap={2}>
        <WorkoutTimer startedAt={startedAt} />
        <AppText preset="columnHeader" color={colors.gray7}>
          {t('workout.duration')}
        </AppText>
      </YStack>
    </XStack>
  )
}
