import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native'
import { YStack, XStack, Spinner } from 'tamagui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useExercise } from '@/hooks/useExercises'
import { getLocalizedExercise } from '@/lib/exercises'
import { AppText } from '@/components/ui/AppText'
import { Badge } from '@/components/ui/Badge'
import { colors, headerButtonStyles, headerButtonIcon } from '@/lib/theme'

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const locale = i18n.language

  const { data: exercise, isLoading, error } = useExercise(id)

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={colors.gray1}>
        <Spinner size="large" color={colors.gray11} />
      </YStack>
    )
  }

  if (error || !exercise) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={colors.gray1}>
        <AppText preset="body">{t('common.error')}</AppText>
      </YStack>
    )
  }

  const { name, cues } = getLocalizedExercise(exercise, locale)
  const muscleLabel = t(`exercises.muscles.${exercise.muscle_primary}`)
  const equipmentLabel = t(`exercises.equipment.${exercise.equipment}`)
  const difficultyLabel = t(`exercises.difficulty.${exercise.difficulty}`)

  const secondaryMuscles = exercise.muscle_secondary ?? []

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel={t('common.goBack')}
          hitSlop={8}
          style={headerButtonStyles.navButton}
        >
          <Ionicons name="chevron-back" size={headerButtonIcon.size} color={headerButtonIcon.color} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <YStack padding={16} gap={20}>
          {/* Animation placeholder */}
          <YStack alignItems="center" paddingVertical={24}>
            <YStack
              width={100}
              height={100}
              borderRadius={24}
              backgroundColor={colors.gray3}
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="body-outline" size={48} color={colors.gray7} />
            </YStack>
          </YStack>

          {/* Exercise name */}
          <AppText
            preset="pageTitle"
            textAlign="center"
            accessibilityRole="header"
          >
            {name}
          </AppText>

          {/* Badge row */}
          <XStack justifyContent="center" gap={8} flexWrap="wrap">
            <Badge variant="label">{muscleLabel}</Badge>
            <Badge variant="label">{equipmentLabel}</Badge>
            <Badge variant="label">{difficultyLabel}</Badge>
          </XStack>

          {/* Secondary muscles */}
          {secondaryMuscles.length > 0 && (
            <YStack gap={8}>
              <AppText preset="label" color={colors.gray7} textTransform="uppercase">
                {t('exercises.secondaryMuscles')}
              </AppText>
              <AppText preset="body">
                {secondaryMuscles
                  .map((m) => t(`exercises.muscles.${m}`))
                  .join(', ')}
              </AppText>
            </YStack>
          )}

          {/* Form cues */}
          {cues && (
            <YStack gap={8}>
              <AppText preset="label" color={colors.gray7} textTransform="uppercase">
                {t('exercises.formCues')}
              </AppText>
              <AppText preset="body" lineHeight={22}>
                {cues}
              </AppText>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
  },
})
