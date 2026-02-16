import { Stack, useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

export default function ProgramLayout() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#111' },
        headerTintColor: '#fff',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel={t('common.goBack')}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="create"
        options={{ headerTitle: '' }}
      />
      <Stack.Screen
        name="[id]"
        options={{ headerTitle: '' }}
      />
      <Stack.Screen
        name="day/[dayId]"
        options={{ headerTitle: '' }}
      />
      <Stack.Screen
        name="add-exercise"
        options={{
          presentation: 'modal',
          headerTitle: '',
        }}
      />
    </Stack>
  )
}
