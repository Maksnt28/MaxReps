import { Stack } from 'expo-router'
import { colors } from '@/lib/theme'

export default function WorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.gray1 },
        headerTintColor: colors.gray12,
        headerTitleStyle: { fontFamily: 'Inter-Bold', fontSize: 17 },
      }}
    >
      <Stack.Screen
        name="add-exercise"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[sessionId]"
        options={{ headerShown: false }}
      />
    </Stack>
  )
}
