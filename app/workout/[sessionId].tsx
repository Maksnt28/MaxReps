import { Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack, XStack } from 'tamagui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useWorkoutSession, type SessionExercise, type SessionSet } from '@/hooks/useWorkoutSession'
import { AppText } from '@/components/ui/AppText'
import { AppCard } from '@/components/ui/AppCard'
import { colors, semantic, headerButtonStyles, headerButtonIcon } from '@/lib/theme'
import { formatDuration } from '@/lib/timerUtils'

export default function SessionDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const { data: session, isLoading, isError } = useWorkoutSession(sessionId!)

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator color={colors.gray7} />
        </YStack>
      </SafeAreaView>
    )
  }

  if (isError || !session) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap={12}>
          <AppText preset="caption" color={colors.gray7}>
            {t('common.error')}
          </AppText>
          <Pressable onPress={() => router.back()} accessibilityLabel={t('workout.back')}>
            <AppText preset="caption" color={colors.accent}>
              {t('workout.back')}
            </AppText>
          </Pressable>
        </YStack>
      </SafeAreaView>
    )
  }

  const date = new Date(session.startedAt)
  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
  const formattedTime = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)

  const totalSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => !s.isWarmup).length, 0,
  )
  const totalVolume = session.exercises.reduce(
    (sum, ex) => sum + ex.sets
      .filter((s) => !s.isWarmup)
      .reduce((v, s) => v + (s.weightKg ?? 0) * (s.reps ?? 0), 0),
    0,
  )
  const formattedVolume = new Intl.NumberFormat(locale).format(Math.round(totalVolume))

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <XStack paddingHorizontal={16} paddingTop={12} paddingBottom={8} alignItems="center" gap={12}>
          <Pressable
            onPress={() => router.back()}
            style={headerButtonStyles.navButton}
            accessibilityLabel={t('workout.back')}
          >
            <Ionicons name="chevron-back" size={headerButtonIcon.size} color={headerButtonIcon.color} />
          </Pressable>
          <YStack flex={1}>
            <AppText preset="exerciseName" color={colors.gray12}>
              {formattedDate}
            </AppText>
            <AppText preset="caption" color={colors.gray7}>
              {formattedTime}
            </AppText>
          </YStack>
        </XStack>

        {/* Summary bar */}
        <XStack paddingHorizontal={16} paddingVertical={12} gap={24}>
          {session.durationSeconds != null && (
            <YStack>
              <AppText preset="caption" color={colors.gray7}>
                {t('workout.summary.duration')}
              </AppText>
              <AppText preset="sessionDuration" color={colors.gray11}>
                {formatDuration(session.durationSeconds)}
              </AppText>
            </YStack>
          )}
          <YStack>
            <AppText preset="caption" color={colors.gray7}>
              {t('workout.summary.sets')}
            </AppText>
            <AppText preset="sessionDuration" color={colors.gray11}>
              {totalSets}
            </AppText>
          </YStack>
          <YStack>
            <AppText preset="caption" color={colors.gray7}>
              {t('workout.summary.totalVolume')}
            </AppText>
            <AppText preset="sessionDuration" color={colors.gray11}>
              {formattedVolume} {t('workout.weight')}
            </AppText>
          </YStack>
        </XStack>

        {/* Exercise cards */}
        <YStack paddingHorizontal={16} gap={12}>
          {session.exercises.map((exercise) => (
            <ExerciseDetailCard
              key={exercise.exerciseId}
              exercise={exercise}
              locale={locale}
            />
          ))}
        </YStack>

        {/* Notes */}
        {session.notes && (
          <YStack paddingHorizontal={16} paddingTop={12}>
            <AppCard>
              <YStack gap={4}>
                <AppText preset="caption" color={colors.gray7} fontWeight="600">
                  {t('workout.notes')}
                </AppText>
                <AppText preset="body" color={colors.gray11}>
                  {session.notes}
                </AppText>
              </YStack>
            </AppCard>
          </YStack>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function ExerciseDetailCard({ exercise, locale }: { exercise: SessionExercise; locale: string }) {
  const { t } = useTranslation()
  const name = locale === 'fr' ? exercise.nameFr : exercise.nameEn

  return (
    <AppCard>
      <YStack gap={6}>
        <AppText preset="exerciseName" color={colors.gray12}>
          {name}
        </AppText>

        {/* Column headers */}
        <XStack paddingVertical={4} paddingHorizontal={12} alignItems="center">
          <AppText preset="columnHeader" color={colors.gray7} width={32}>
            {t('workout.set')}
          </AppText>
          <AppText preset="columnHeader" color={colors.gray7} flex={1}>
            {t('workout.weight')}
          </AppText>
          <AppText preset="columnHeader" color={colors.gray7} flex={1}>
            {t('workout.reps')}
          </AppText>
          <AppText preset="columnHeader" color={colors.gray7} width={40}>
            {t('workout.rpe')}
          </AppText>
          <YStack width={18} />
        </XStack>

        {/* Set rows */}
        {exercise.sets.map((set) => (
          <SetDetailRow key={set.id} set={set} />
        ))}
      </YStack>
    </AppCard>
  )
}

function SetDetailRow({ set }: { set: SessionSet }) {
  const { t } = useTranslation()

  return (
    <XStack paddingVertical={6} paddingHorizontal={12} alignItems="center">
      <AppText width={32} color={set.isWarmup ? colors.gray5 : colors.gray9} preset="setReps">
        {set.isWarmup ? t('workout.warmup') : set.setNumber}
      </AppText>
      <AppText flex={1} color={set.isWarmup ? colors.gray5 : colors.gray11} preset="setReps">
        {set.weightKg != null ? `${set.weightKg}` : '—'}
      </AppText>
      <AppText flex={1} color={set.isWarmup ? colors.gray5 : colors.gray11} preset="setReps">
        {set.reps != null ? `${set.reps}` : '—'}
      </AppText>
      <AppText width={40} color={colors.gray7} preset="setReps">
        {set.rpe != null ? `${set.rpe}` : ''}
      </AppText>
      <YStack width={18} alignItems="center">
        {set.isPr && <Ionicons name="trophy" size={14} color={semantic.pr} />}
      </YStack>
    </XStack>
  )
}
