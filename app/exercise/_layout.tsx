import { Stack } from 'expo-router'
import { colors } from '@/lib/theme'

export default function ExerciseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.gray1 },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{ presentation: 'card' }}
      />
    </Stack>
  )
}
