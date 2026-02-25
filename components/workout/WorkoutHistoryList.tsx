import { useMemo, useCallback } from 'react'
import { SectionList, ActivityIndicator, RefreshControl } from 'react-native'
import { YStack } from 'tamagui'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useWorkoutSessions, type SessionSummary } from '@/hooks/useWorkoutSessions'
import { useExercises } from '@/hooks/useExercises'
import { getLocalizedExercise } from '@/lib/exercises'
import { colors } from '@/lib/theme'
import { AppText } from '@/components/ui/AppText'
import { EmptyState } from '@/components/EmptyState'
import { SessionCard } from './SessionCard'

export function WorkoutHistoryList() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useWorkoutSessions()
  const { data: exercises } = useExercises()

  // Build exercise ID → localized name map
  const exerciseMap = useMemo(() => {
    const map = new Map<string, string>()
    exercises?.forEach((e) => map.set(e.id, getLocalizedExercise(e, locale).name))
    return map
  }, [exercises, locale])

  // Flatten all pages into one array
  const allSessions = useMemo(
    () => data?.pages.flatMap((p) => p.sessions) ?? [],
    [data],
  )

  // Group by YYYY-MM → SectionList sections
  const sections = useMemo(() => {
    const grouped = new Map<string, SessionSummary[]>()
    for (const session of allSessions) {
      const date = new Date(session.startedAt)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(session)
    }
    // Use local Date constructor to avoid UTC midnight rollback
    return [...grouped.entries()].map(([key, sessions]) => {
      const [year, month] = key.split('-').map(Number)
      return {
        title: new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(
          new Date(year, month - 1, 1),
        ),
        data: sessions,
      }
    })
  }, [allSessions, locale])

  // Resolve exerciseIds → localized names
  const resolveNames = useCallback(
    (exerciseIds: string[]): string[] => {
      return exerciseIds
        .map((id) => exerciseMap.get(id))
        .filter(Boolean) as string[]
    },
    [exerciseMap],
  )

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <ActivityIndicator color={colors.gray7} />
      </YStack>
    )
  }

  if (isError) {
    return (
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
    )
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      stickySectionHeadersEnabled
      renderSectionHeader={({ section: { title } }) => (
        <YStack backgroundColor={colors.gray1} paddingVertical={8} paddingTop={16}>
          <AppText preset="caption" color={colors.gray7} fontWeight="600">
            {title}
          </AppText>
        </YStack>
      )}
      renderItem={({ item }) => (
        <YStack paddingBottom={8}>
          <SessionCard
            session={item}
            exerciseNames={resolveNames(item.exerciseIds)}
            onPress={() => router.push(`/workout/${item.id}`)}
          />
        </YStack>
      )}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <YStack paddingVertical={16} alignItems="center">
            <ActivityIndicator color={colors.gray7} />
          </YStack>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState
          title={t('workout.noHistory')}
          message={t('workout.noHistorySubtitle')}
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
  )
}
