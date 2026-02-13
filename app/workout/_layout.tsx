import { Stack, useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

export default function WorkoutLayout() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#111' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="add-exercise"
        options={{
          presentation: 'modal',
          headerTitle: t('workout.addExercise'),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityLabel={t('common.cancel')}
              hitSlop={8}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  )
}
