import { Stack } from 'expo-router'
import { colors } from '@/lib/theme'

export default function ProgramLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.gray1 },
      }}
    >
      <Stack.Screen name="create" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="day/[dayId]" />
      <Stack.Screen
        name="add-exercise"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  )
}
