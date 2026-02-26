import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, ScrollView, type NativeScrollEvent, type NativeSyntheticEvent, type LayoutChangeEvent } from 'react-native'
import { YStack, XStack, View } from 'tamagui'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'

import { useNextProgramDay } from '@/hooks/useNextProgramDay'
import { estimateDuration } from '@/lib/nextProgramDay'
import { useCreateSession } from '@/hooks/useWorkoutMutations'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { useRestTimerStore } from '@/stores/useRestTimerStore'
import { useExercises } from '@/hooks/useExercises'
import { getLocalizedExercise } from '@/lib/exercises'
import { AppCard } from '@/components/ui/AppCard'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { colors } from '@/lib/theme'
import type { ProgramDayWithExercises } from '@/hooks/usePrograms'

const MAX_EXERCISE_NAMES = 3

interface DayPageProps {
  day: ProgramDayWithExercises
  width: number
  completedAt: string | undefined
  locale: string
  t: (key: string, opts?: Record<string, unknown>) => string
}

function DayPage({ day, width, completedAt, locale, t }: DayPageProps) {
  const exercises = day.program_exercises

  // Exercise names preview
  const exerciseNames = exercises
    .slice(0, MAX_EXERCISE_NAMES)
    .map((pe) =>
      locale === 'fr'
        ? (pe.exercise as any)?.name_fr ?? (pe.exercise as any)?.name_en
        : (pe.exercise as any)?.name_en,
    )
    .filter(Boolean)
  const overflowCount = exercises.length - MAX_EXERCISE_NAMES
  const exercisePreview =
    exerciseNames.join(' · ') +
    (overflowCount > 0 ? ` ${t('home.exercisesMore', { count: overflowCount })}` : '')

  const duration = estimateDuration(exercises)
  const exerciseCount = exercises.length

  // Format completed day name
  const completedLabel = completedAt
    ? t('home.completedOn', {
        day: new Date(completedAt).toLocaleDateString(locale, { weekday: 'long' }),
      })
    : null

  return (
    <YStack width={width} gap={10}>
      {/* Completed badge */}
      {completedLabel && (
        <AppText preset="caption" color={colors.progress} fontSize={11}>
          {completedLabel}
        </AppText>
      )}

      {/* Day name */}
      <AppText preset="exerciseName" color={colors.gray12}>
        {day.name}
      </AppText>

      {/* Exercise preview */}
      {exercisePreview ? (
        <AppText preset="caption" color={colors.gray7} numberOfLines={1}>
          {exercisePreview}
        </AppText>
      ) : null}

      {/* Count + duration */}
      <AppText preset="caption" color={colors.gray7}>
        {t('home.exercisesCount', { count: exerciseCount })}
        {duration > 0 ? ` · ${t('home.estimatedDuration', { minutes: duration })}` : ''}
      </AppText>
    </YStack>
  )
}

export function NextWorkoutCard() {
  const { data, isLoading } = useNextProgramDay()
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const router = useRouter()
  const queryClient = useQueryClient()

  const isActive = useWorkoutStore((s) => s.isActive)
  const activeProgramDayId = useWorkoutStore((s) => s.programDayId)
  const activeExercises = useWorkoutStore((s) => s.exercises)
  const startWorkout = useWorkoutStore((s) => s.startWorkout)
  const loadProgramDay = useWorkoutStore((s) => s.loadProgramDay)
  const resetTimer = useRestTimerStore((s) => s.reset)
  const { data: allExercises } = useExercises()

  const createSession = useCreateSession()

  // Swipe pager state
  const scrollRef = useRef<ScrollView>(null)
  const [pageWidth, setPageWidth] = useState(0)
  const [currentPage, setCurrentPage] = useState(data?.dayIndex ?? 0)

  // Scroll to suggested day when data changes
  useEffect(() => {
    if (data?.dayIndex != null && pageWidth > 0) {
      setCurrentPage(data.dayIndex)
      scrollRef.current?.scrollTo({ x: data.dayIndex * pageWidth, animated: false })
    }
  }, [data?.dayIndex, pageWidth])

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setPageWidth(e.nativeEvent.layout.width)
  }, [])

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageWidth === 0) return
      const page = Math.round(e.nativeEvent.contentOffset.x / pageWidth)
      setCurrentPage(page)
    },
    [pageWidth],
  )

  // Build exercise name map for active session display
  const exerciseMap = useMemo(() => {
    const map = new Map<string, NonNullable<typeof allExercises>[number]>()
    allExercises?.forEach((e) => map.set(e.id, e))
    return map
  }, [allExercises])

  if (isLoading && !isActive) return null

  // Active workout → show in-progress session info
  if (isActive) {
    // Try to find program day name for active workout
    const activeDayName = activeProgramDayId
      ? data?.allDays?.find((d) => d.id === activeProgramDayId)?.name
      : null

    const activeNames = activeExercises
      .slice(0, MAX_EXERCISE_NAMES)
      .map((ae) => {
        const ex = exerciseMap.get(ae.exerciseId)
        return ex ? getLocalizedExercise(ex, locale).name : null
      })
      .filter(Boolean)
    const activeOverflow = activeExercises.length - MAX_EXERCISE_NAMES
    const activePreview =
      activeNames.join(' · ') +
      (activeOverflow > 0 ? ` ${t('home.exercisesMore', { count: activeOverflow })}` : '')

    // Set progress
    let completedSets = 0
    let totalSets = 0
    for (const e of activeExercises) {
      for (const s of e.sets) {
        if (s.isWarmup) continue
        totalSets++
        if (s.isCompleted) completedSets++
      }
    }

    return (
      <AppCard>
        <YStack gap={10}>
          <AppText preset="caption" color={colors.accent}>
            {t('home.activeSession')}
          </AppText>

          {activeDayName ? (
            <AppText preset="exerciseName" color={colors.gray12}>
              {activeDayName}
            </AppText>
          ) : activePreview ? (
            <AppText preset="caption" color={colors.gray7} numberOfLines={1}>
              {activePreview}
            </AppText>
          ) : null}

          {activeExercises.length > 0 && (
            <AppText preset="caption" color={colors.gray7}>
              {t('home.exercisesCount', { count: activeExercises.length })}
              {totalSets > 0 ? ` · ${t('home.setsProgress', { completed: completedSets, total: totalSets })}` : ''}
            </AppText>
          )}

          <AppButton
            variant="primary"
            onPress={() => router.push('/(tabs)/workout')}
            accessibilityLabel={t('home.continueWorkout')}
          >
            {t('home.continueWorkout')}
          </AppButton>
        </YStack>
      </AppCard>
    )
  }

  // No active program → fallback
  if (!data) {
    return (
      <AppCard>
        <YStack gap={8}>
          <AppText preset="caption" color={colors.gray7}>
            {t('home.setupProgram')}
          </AppText>
          <AppText
            preset="caption"
            color={colors.accent}
            onPress={() => router.push('/(tabs)/programs')}
            accessibilityLabel={t('home.browsePrograms')}
          >
            {t('home.browsePrograms')} →
          </AppText>
        </YStack>
      </AppCard>
    )
  }

  const { allDays, program, totalDays, dayCompletions } = data
  const safePage = currentPage < totalDays ? currentPage : 0
  const showDots = totalDays > 1

  async function doStart(day: ProgramDayWithExercises) {
    try {
      resetTimer()
      const exercises = day.program_exercises
      const session = await createSession.mutateAsync({ programDayId: day.id })
      startWorkout(session.id, day.id)
      loadProgramDay(
        exercises.map((pe) => ({
          exerciseId: pe.exercise_id,
          setsTarget: pe.sets_target,
          repsTarget: pe.reps_target,
          restSeconds: pe.rest_seconds,
        })),
      )
      queryClient.invalidateQueries({ queryKey: ['next-program-day'] })
      router.push('/(tabs)/workout')
    } catch {
      Alert.alert(t('programs.startWorkoutError'))
    }
  }

  return (
    <AppCard>
      <YStack gap={10}>
        {/* Header: program name + day counter */}
        <XStack justifyContent="space-between" alignItems="center">
          <AppText preset="caption" color={colors.gray7}>
            {program.name}
          </AppText>
          <AppText preset="caption" color={colors.gray7}>
            {t('home.dayOf', { current: safePage + 1, total: totalDays })}
          </AppText>
        </XStack>

        {/* Swipe pager — content only, button is anchored below */}
        <View onLayout={handleLayout}>
          {pageWidth > 0 && (
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollEnd}
              scrollEventThrottle={16}
            >
              {allDays.map((day) => (
                <DayPage
                  key={day.id}
                  day={day}
                  width={pageWidth}
                  completedAt={dayCompletions[day.id]}
                  locale={locale}
                  t={t}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Pagination dots */}
        {showDots && (
          <XStack justifyContent="center" alignItems="center" gap={6}>
            {allDays.map((day, i) => (
              <View
                key={day.id}
                width={6}
                height={6}
                borderRadius={3}
                backgroundColor={i === safePage ? colors.accent : colors.gray4}
              />
            ))}
          </XStack>
        )}

        {/* CTA — fixed position outside pager */}
        <AppButton
          variant="primary"
          onPress={() => doStart(allDays[safePage])}
          disabled={allDays[safePage].program_exercises.length === 0 || createSession.isPending}
          loading={createSession.isPending}
          accessibilityLabel={t('home.startWorkout')}
        >
          {t('home.startWorkout')}
        </AppButton>
      </YStack>
    </AppCard>
  )
}
