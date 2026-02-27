import { useEffect, useMemo, useState } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack, Spinner } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'

import { useExercises } from '@/hooks/useExercises'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useExerciseStore } from '@/stores/useExerciseStore'
import { filterExercises, MUSCLE_GROUPS, EQUIPMENT } from '@/lib/exercises'
import { SearchBar } from '@/components/SearchBar'
import { FilterButtons } from '@/components/FilterButtons'
import {
  ExerciseListItem,
  EXERCISE_LIST_ITEM_HEIGHT,
} from '@/components/ExerciseListItem'
import { EmptyState } from '@/components/EmptyState'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { colors, spacing } from '@/lib/theme'

export default function ExercisesScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const locale = i18n.language

  const { data: exercises, isLoading, error, refetch } = useExercises()

  const { filters, setSearch, setMuscleGroup, setEquipment, clearFilters } =
    useExerciseStore()

  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebouncedValue(searchInput, 150)

  useEffect(() => {
    setSearch(debouncedSearch)
  }, [debouncedSearch, setSearch])

  const filteredExercises = useMemo(() => {
    if (!exercises) return []
    return filterExercises(
      exercises,
      { ...filters, search: debouncedSearch },
      locale,
    )
  }, [exercises, filters, debouncedSearch, locale])

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.gray11} />
        </YStack>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap={12}>
          <AppText preset="body">{t('common.error')}</AppText>
          <AppButton variant="secondary" onPress={() => refetch()} accessibilityLabel={t('common.retry')}>
            {t('common.retry')}
          </AppButton>
        </YStack>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
      <YStack flex={1} backgroundColor={colors.gray1}>
        <YStack paddingHorizontal={16} paddingTop={16} paddingBottom={8}>
          <AppText fontSize={28} fontWeight="800" color={colors.gray12}>
            {t('tabs.exercises')}
          </AppText>
        </YStack>
        <SearchBar value={searchInput} onChangeText={setSearchInput} />
        <FilterButtons
          muscleGroup={filters.muscleGroup}
          equipment={filters.equipment}
          onSelectMuscle={setMuscleGroup}
          onSelectEquipment={setEquipment}
          muscleOptions={[...MUSCLE_GROUPS]}
          equipmentOptions={[...EQUIPMENT]}
          muscleLabelKey={(v) => t(`exercises.muscles.${v}`)}
          equipmentLabelKey={(v) => t(`exercises.equipment.${v}`)}
        />
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          getItemLayout={(_, index) => ({
            length: EXERCISE_LIST_ITEM_HEIGHT,
            offset: EXERCISE_LIST_ITEM_HEIGHT * index,
            index,
          })}
          renderItem={({ item }) => (
            <ExerciseListItem
              exercise={item}
              locale={locale}
              onPress={() => router.push(`/exercise/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title={t('exercises.emptyTitle')}
              message={t('exercises.emptyMessage')}
              onAction={clearFilters}
              actionLabel={t('exercises.clearFilters')}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor={colors.gray11}
            />
          }
          contentContainerStyle={
            filteredExercises.length === 0
              ? { flexGrow: 1 }
              : { paddingHorizontal: spacing.screenPaddingH, gap: spacing.cardGap, paddingTop: 4, paddingBottom: 100 }
          }
        />
      </YStack>
    </SafeAreaView>
  )
}
