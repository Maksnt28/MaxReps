import { useMemo } from 'react'
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { YStack, XStack, Text, Button } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { useExercises } from '@/hooks/useExercises'
import { WorkoutHeader } from './WorkoutHeader'
import { ExerciseCard } from './ExerciseCard'

interface ActiveWorkoutScreenProps {
  onFinish: () => void
}

export function ActiveWorkoutScreen({ onFinish }: ActiveWorkoutScreenProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const locale = i18n.language

  const exercises = useWorkoutStore((s) => s.exercises)
  const startedAt = useWorkoutStore((s) => s.startedAt)
  const { data: allExercises } = useExercises()

  const exerciseMap = useMemo(() => {
    const map = new Map<string, NonNullable<typeof allExercises>[number]>()
    allExercises?.forEach((e) => map.set(e.id, e))
    return map
  }, [allExercises])

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <YStack flex={1} backgroundColor="$background">
        {startedAt && <WorkoutHeader startedAt={startedAt} onFinish={onFinish} />}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {exercises.length === 0 ? (
            <YStack alignItems="center" justifyContent="center" paddingVertical="$10" gap="$3">
              <Ionicons name="barbell-outline" size={48} color="#555" />
              <Text color="$gray10" fontSize={16} fontWeight="500">
                {t('workout.noExercises')}
              </Text>
              <Text color="$gray10" fontSize={14} textAlign="center">
                {t('workout.noExercisesMessage')}
              </Text>
            </YStack>
          ) : (
            exercises.map((ae) => (
              <ExerciseCard
                key={ae.exerciseId}
                activeExercise={ae}
                exercise={exerciseMap.get(ae.exerciseId)}
                locale={locale}
              />
            ))
          )}
        </ScrollView>

        {/* Floating add exercise button */}
        <YStack
          position="absolute"
          bottom={16}
          left={0}
          right={0}
          alignItems="center"
        >
          <Button
            size="$4"
            backgroundColor="$color"
            borderRadius="$10"
            onPress={() => router.push('/workout/add-exercise')}
            accessibilityLabel={t('workout.addExercise')}
            elevation={4}
          >
            <XStack alignItems="center" gap="$2">
              <Ionicons name="add" size={20} color="#000" />
              <Text color="$background" fontWeight="600">
                {t('workout.addExercise')}
              </Text>
            </XStack>
          </Button>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}
