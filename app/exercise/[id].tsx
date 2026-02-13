import { ScrollView } from 'react-native'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useExercise } from '@/hooks/useExercises'
import { getLocalizedExercise } from '@/lib/exercises'

function Badge({ label }: { label: string }) {
  return (
    <XStack
      backgroundColor="$backgroundHover"
      paddingHorizontal="$2.5"
      paddingVertical="$1.5"
      borderRadius="$3"
    >
      <Text color="$color" fontSize={13} fontWeight="500">
        {label}
      </Text>
    </XStack>
  )
}

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const { data: exercise, isLoading, error } = useExercise(id)

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Spinner size="large" color="$color" />
      </YStack>
    )
  }

  if (error || !exercise) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Text color="$color">{t('common.error')}</Text>
      </YStack>
    )
  }

  const { name, cues } = getLocalizedExercise(exercise, locale)
  const muscleLabel = t(`exercises.muscles.${exercise.muscle_primary}`)
  const equipmentLabel = t(`exercises.equipment.${exercise.equipment}`)
  const difficultyLabel = t(`exercises.difficulty.${exercise.difficulty}`)

  const secondaryMuscles = exercise.muscle_secondary ?? []

  return (
    <>
      <Stack.Screen options={{ headerTitle: name }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#000' }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <YStack padding="$4" gap="$5">
          {/* Animation placeholder */}
          <YStack alignItems="center" paddingVertical="$6">
            <YStack
              width={100}
              height={100}
              borderRadius="$6"
              backgroundColor="$backgroundHover"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="body-outline" size={48} color="#888" />
            </YStack>
          </YStack>

          {/* Exercise name */}
          <Text
            color="$color"
            fontSize={26}
            fontWeight="700"
            textAlign="center"
            accessibilityRole="header"
          >
            {name}
          </Text>

          {/* Badge row */}
          <XStack justifyContent="center" gap="$2" flexWrap="wrap">
            <Badge label={muscleLabel} />
            <Badge label={equipmentLabel} />
            <Badge label={difficultyLabel} />
          </XStack>

          {/* Secondary muscles */}
          {secondaryMuscles.length > 0 && (
            <YStack gap="$2">
              <Text color="$gray10" fontSize={14} fontWeight="600" textTransform="uppercase">
                {t('exercises.secondaryMuscles')}
              </Text>
              <Text color="$color" fontSize={15}>
                {secondaryMuscles
                  .map((m) => t(`exercises.muscles.${m}`))
                  .join(', ')}
              </Text>
            </YStack>
          )}

          {/* Form cues */}
          {cues && (
            <YStack gap="$2">
              <Text color="$gray10" fontSize={14} fontWeight="600" textTransform="uppercase">
                {t('exercises.formCues')}
              </Text>
              <Text color="$color" fontSize={15} lineHeight={22}>
                {cues}
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </>
  )
}
