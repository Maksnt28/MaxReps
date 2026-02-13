import { Stack, useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'

export default function ExerciseLayout() {
  const router = useRouter()

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#111' },
        headerTintColor: '#fff',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          presentation: 'card',
          headerTitle: '',
        }}
      />
    </Stack>
  )
}
