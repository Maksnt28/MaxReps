import { Alert } from 'react-native'
import { YStack, Text, Button, Spinner } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { useCreateSession } from '@/hooks/useWorkoutMutations'

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
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background" gap="$4">
      <YStack
        width={80}
        height={80}
        borderRadius="$6"
        backgroundColor="$backgroundHover"
        alignItems="center"
        justifyContent="center"
      >
        <Ionicons name="barbell-outline" size={40} color="#888" />
      </YStack>
      <Text color="$gray10" fontSize={15}>
        {t('workout.startSubtitle')}
      </Text>
      <Button
        size="$5"
        backgroundColor="$color"
        onPress={handleStart}
        disabled={createSession.isPending}
        accessibilityLabel={t('workout.startWorkout')}
      >
        {createSession.isPending ? (
          <Spinner size="small" color="$background" />
        ) : (
          <Text color="$background" fontSize={17} fontWeight="700">
            {t('workout.startWorkout')}
          </Text>
        )}
      </Button>
    </YStack>
  )
}
