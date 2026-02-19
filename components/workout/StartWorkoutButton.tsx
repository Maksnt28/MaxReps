import { Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
      <YStack paddingHorizontal={16} paddingTop={16} paddingBottom={8}>
        <AppText fontSize={28} fontWeight="800" color={colors.gray12}>
          {t('tabs.workout')}
        </AppText>
      </YStack>
      <YStack flex={1} alignItems="center" justifyContent="center" gap={16}>
        <YStack
          width={80}
          height={80}
          borderRadius={16}
          backgroundColor={colors.gray3}
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name="barbell-outline" size={40} color={colors.gray7} />
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
    </SafeAreaView>
  )
}
