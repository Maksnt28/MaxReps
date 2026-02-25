import { useState, useMemo, useCallback, useEffect } from 'react'
import { FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import { YStack } from 'tamagui'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'

import { useMonthSessions, monthSessionsQueryKey, monthSessionsQueryFn } from '@/hooks/useMonthSessions'
import { useExercises } from '@/hooks/useExercises'
import { getLocalizedExercise } from '@/lib/exercises'
import {
  buildCalendarGrid,
  formatMonthYear,
  getWeekdayHeaders,
  isCurrentMonth,
  prevMonth,
  nextMonth,
} from '@/lib/calendarUtils'
import { colors } from '@/lib/theme'
import { AppText } from '@/components/ui/AppText'
import { EmptyState } from '@/components/EmptyState'
import { MonthNavigator } from './MonthNavigator'
import { MiniCalendar } from './MiniCalendar'
import { MonthSummary } from './MonthSummary'
import { SessionCard } from './SessionCard'
import type { SessionSummary } from '@/hooks/useWorkoutSessions'

export function WorkoutHistoryList() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const queryClient = useQueryClient()

  // Current month state
  const now = new Date()
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const { data: monthData, isLoading, isError, refetch, isRefetching } = useMonthSessions(currentYear, currentMonth)
  const { data: exercises } = useExercises()

  // Build exercise ID → localized name map
  const exerciseMap = useMemo(() => {
    const map = new Map<string, string>()
    exercises?.forEach((e) => map.set(e.id, getLocalizedExercise(e, locale).name))
    return map
  }, [exercises, locale])

  // Calendar grid
  const grid = useMemo(
    () => buildCalendarGrid(currentYear, currentMonth),
    [currentYear, currentMonth],
  )
  const weekdayHeaders = useMemo(() => getWeekdayHeaders(locale), [locale])
  const monthTitle = useMemo(
    () => formatMonthYear(currentYear, currentMonth, locale),
    [currentYear, currentMonth, locale],
  )
  const canGoNext = !isCurrentMonth(currentYear, currentMonth)

  // Today's day number (only if viewing current month)
  const todayDay = isCurrentMonth(currentYear, currentMonth) ? now.getDate() : null

  // Month data
  const sessions = monthData?.sessions ?? []
  const workoutDays = monthData?.workoutDays ?? new Set<number>()
  const prDays = monthData?.prDays ?? new Set<number>()

  // Filter sessions by selected day
  const displayedSessions = useMemo(() => {
    if (selectedDay === null) return sessions
    return sessions.filter((s) => new Date(s.startedAt).getDate() === selectedDay)
  }, [sessions, selectedDay])

  // Navigate months
  const handlePrev = useCallback(() => {
    const prev = prevMonth(currentYear, currentMonth)
    setCurrentYear(prev.year)
    setCurrentMonth(prev.month)
    setSelectedDay(null)
  }, [currentYear, currentMonth])

  const handleNext = useCallback(() => {
    if (!canGoNext) return
    const next = nextMonth(currentYear, currentMonth)
    setCurrentYear(next.year)
    setCurrentMonth(next.month)
    setSelectedDay(null)
  }, [currentYear, currentMonth, canGoNext])

  // Calendar day tap: toggle filter
  const handleDayPress = useCallback((day: number) => {
    setSelectedDay((prev) => (prev === day ? null : day))
  }, [])

  // Resolve exerciseIds → localized names
  const resolveNames = useCallback(
    (exerciseIds: string[]): string[] => {
      return exerciseIds
        .map((id) => exerciseMap.get(id))
        .filter(Boolean) as string[]
    },
    [exerciseMap],
  )

  // Pre-fetch adjacent months
  useEffect(() => {
    const prev = prevMonth(currentYear, currentMonth)
    const next = nextMonth(currentYear, currentMonth)

    queryClient.prefetchQuery({
      queryKey: monthSessionsQueryKey(prev.year, prev.month),
      queryFn: () => monthSessionsQueryFn(prev.year, prev.month),
      staleTime: 10 * 60 * 1000,
    })

    if (!isCurrentMonth(currentYear, currentMonth)) {
      queryClient.prefetchQuery({
        queryKey: monthSessionsQueryKey(next.year, next.month),
        queryFn: () => monthSessionsQueryFn(next.year, next.month),
        staleTime: 10 * 60 * 1000,
      })
    }
  }, [currentYear, currentMonth, queryClient])

  const renderItem = useCallback(
    ({ item }: { item: SessionSummary }) => (
      <YStack paddingHorizontal={16} paddingBottom={8}>
        <SessionCard
          session={item}
          exerciseNames={resolveNames(item.exerciseIds)}
          onPress={() => router.push(`/workout/${item.id}`)}
        />
      </YStack>
    ),
    [resolveNames, router],
  )

  const ListHeader = useMemo(() => (
    <>
      <YStack paddingHorizontal={16} paddingBottom={8}>
        <MiniCalendar
          year={currentYear}
          month={currentMonth}
          grid={grid}
          workoutDays={workoutDays}
          prDays={prDays}
          locale={locale}
          weekdayHeaders={weekdayHeaders}
          selectedDay={selectedDay}
          todayDay={todayDay}
          onDayPress={handleDayPress}
        />
      </YStack>
      <MonthSummary
        sessionCount={monthData?.totalSessions ?? 0}
        totalVolume={monthData?.totalVolume ?? 0}
        prCount={monthData?.totalPRs ?? 0}
        locale={locale}
      />
      {selectedDay !== null && (
        <YStack paddingHorizontal={16} paddingBottom={4}>
          <AppText
            preset="caption"
            color={colors.accent}
            onPress={() => setSelectedDay(null)}
            accessibilityLabel={t('workout.showAll')}
          >
            {t('workout.showAll')}
          </AppText>
        </YStack>
      )}
    </>
  ), [currentYear, currentMonth, grid, workoutDays, prDays, locale, weekdayHeaders, selectedDay, todayDay, handleDayPress, monthData, t])

  if (isLoading) {
    return (
      <YStack flex={1}>
        <MonthNavigator
          title={monthTitle}
          canGoNext={canGoNext}
          onPrev={handlePrev}
          onNext={handleNext}
        />
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator color={colors.gray7} />
        </YStack>
      </YStack>
    )
  }

  if (isError) {
    return (
      <YStack flex={1}>
        <MonthNavigator
          title={monthTitle}
          canGoNext={canGoNext}
          onPrev={handlePrev}
          onNext={handleNext}
        />
        <YStack flex={1} alignItems="center" justifyContent="center" padding={24} gap={12}>
          <AppText preset="caption" color={colors.gray7}>
            {t('common.error')}
          </AppText>
          <AppText
            preset="caption"
            color={colors.accent}
            onPress={() => refetch()}
            accessibilityLabel={t('common.retry')}
          >
            {t('common.retry')}
          </AppText>
        </YStack>
      </YStack>
    )
  }

  return (
    <YStack flex={1}>
      <MonthNavigator
        title={monthTitle}
        canGoNext={canGoNext}
        onPrev={handlePrev}
        onNext={handleNext}
      />
      <FlatList
        data={displayedSessions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState
            title={t('workout.noSessionsMonth')}
            message={t('workout.noSessionsMonthSub')}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.gray7}
          />
        }
      />
    </YStack>
  )
}
