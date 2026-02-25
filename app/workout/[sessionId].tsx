import { Alert, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack, XStack } from 'tamagui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useWorkoutSession, type SessionExercise, type SessionSet } from '@/hooks/useWorkoutSession'
import { useCreateSession, useDiscardWorkout } from '@/hooks/useWorkoutMutations'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { useRestTimerStore } from '@/stores/useRestTimerStore'
import { AppText } from '@/components/ui/AppText'
import { AppCard } from '@/components/ui/AppCard'
import { colors, semantic, headerButtonStyles, headerButtonIcon } from '@/lib/theme'
import { formatDuration } from '@/lib/timerUtils'

export default function SessionDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const queryClient = useQueryClient()

  const { data: sessionData, isLoading, isError } = useWorkoutSession(sessionId!)
  const createSession = useCreateSession()
  const discardWorkout = useDiscardWorkout()

  const currentSessionId = useWorkoutStore((s) => s.sessionId)
  const isActive = useWorkoutStore((s) => s.isActive)
  const startWorkout = useWorkoutStore((s) => s.startWorkout)
  const loadProgramDay = useWorkoutStore((s) => s.loadProgramDay)
  const endWorkout = useWorkoutStore((s) => s.endWorkout)
  const resetTimer = useRestTimerStore((s) => s.reset)

  async function doRepeatWorkout() {
    if (!sessionData) return
    try {
      const newSession = await createSession.mutateAsync({
        programDayId: sessionData.programDayId ?? undefined,
      })
      startWorkout(newSession.id, sessionData.programDayId ?? undefined)
      loadProgramDay(
        sessionData.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          setsTarget: ex.sets.filter((s) => !s.isWarmup).length,
          repsTarget: null,
          restSeconds: null,
        }))
      )
      queryClient.invalidateQueries({ queryKey: ['month-sessions'] })
      router.replace('/(tabs)/workout')
    } catch {
      Alert.alert(t('common.error'))
    }
  }

  function handleRepeat() {
    if (!sessionData || sessionData.exercises.length === 0) return

    if (isActive) {
      Alert.alert(
        t('workout.repeatConfirmTitle'),
        t('workout.repeatConfirmMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('workout.repeatConfirmAction'),
            style: 'destructive',
            onPress: async () => {
              try {
                if (currentSessionId) {
                  await discardWorkout.mutateAsync(currentSessionId)
                }
                endWorkout()
                resetTimer()
                doRepeatWorkout()
              } catch {
                Alert.alert(t('common.error'))
              }
            },
          },
        ]
      )
    } else {
      resetTimer()
      doRepeatWorkout()
    }
  }

  // Alias for consistent naming in JSX below
  const session = sessionData

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
            {session.programDayName && (
              <AppText preset="caption" color={colors.gray8} fontWeight="600">
                {session.programDayName}
              </AppText>
            )}
            <AppText preset="caption" color={colors.gray7}>
              {formattedTime}
            </AppText>
          </YStack>
          <Pressable
            onPress={handleRepeat}
            style={headerButtonStyles.navButton}
            disabled={session.exercises.length === 0 || createSession.isPending}
            accessibilityLabel={t('workout.repeatWorkout')}
          >
            <Ionicons
              name="repeat"
              size={headerButtonIcon.size}
              color={session.exercises.length === 0 ? colors.gray5 : headerButtonIcon.color}
            />
          </Pressable>
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
