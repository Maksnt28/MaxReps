import { Alert } from 'react-native'
import { YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { useCreateSession } from '@/hooks/useWorkoutMutations'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { colors } from '@/lib/theme'

export function StartWorkoutButton() {
  const { t } = useTranslation()
  const startWorkout = useWorkoutStore((s) => s.startWorkout)
  const createSession = useCreateSession()

  async function handleStart() {
    try {
      const { id } = await createSession.mutateAsync({})
      startWorkout(id)
    } catch {
      Alert.alert(t('common.error'), t('workout.startError'))
    }
  }

  return (
    <YStack alignItems="center" gap={12} paddingVertical={16}>
      <YStack
        width={64}
        height={64}
        borderRadius={14}
        backgroundColor={colors.gray3}
        alignItems="center"
        justifyContent="center"
      >
        <Ionicons name="barbell-outline" size={32} color={colors.gray7} />
      </YStack>
      <AppText preset="caption" color={colors.gray8}>
        {t('workout.startSubtitle')}
      </AppText>
      <AppButton
        variant="primary"
        onPress={handleStart}
        loading={createSession.isPending}
        accessibilityLabel={t('workout.startWorkout')}
      >
        {t('workout.startWorkout')}
      </AppButton>
    </YStack>
  )
}
