import { XStack, Button, Text } from 'tamagui'
import { useTranslation } from 'react-i18next'

import { WorkoutTimer } from './WorkoutTimer'

interface WorkoutHeaderProps {
  startedAt: string
  onFinish: () => void
}

export function WorkoutHeader({ startedAt, onFinish }: WorkoutHeaderProps) {
  const { t } = useTranslation()

  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="$4"
      paddingVertical="$3"
    >
      <WorkoutTimer startedAt={startedAt} />
      <Button
        size="$3"
        backgroundColor="$red10"
        onPress={onFinish}
        accessibilityLabel={t('workout.finishWorkout')}
      >
        <Text color="white" fontWeight="600">
          {t('workout.finishWorkout')}
        </Text>
      </Button>
    </XStack>
  )
}
