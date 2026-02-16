import { useEffect, useMemo, useState } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack, Spinner, Text, Button } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'

import { useExercises } from '@/hooks/useExercises'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useExerciseStore } from '@/stores/useExerciseStore'
import { filterExercises } from '@/lib/exercises'
import { SearchBar } from '@/components/SearchBar'
import { FilterChips } from '@/components/FilterChips'
import {
  ExerciseListItem,
  EXERCISE_LIST_ITEM_HEIGHT,
} from '@/components/ExerciseListItem'
import { EmptyState } from '@/components/EmptyState'

const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'abs',
] as const

const EQUIPMENT = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'bodyweight',
  'bands',
  'kettlebell',
] as const

export default function ExercisesScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const locale = i18n.language

  const { data: exercises, isLoading, error, refetch } = useExercises()

  const { filters, setSearch, setMuscleGroup, setEquipment, clearFilters } =
    useExerciseStore()

  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebouncedValue(searchInput, 150)

  // Sync debounced search to store
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="$color" />
        </YStack>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
          <Text color="$color" fontSize={16}>
            {t('common.error')}
          </Text>
          <Button onPress={() => refetch()} accessibilityLabel={t('common.retry')}>
            {t('common.retry')}
          </Button>
        </YStack>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      <YStack flex={1} backgroundColor="$background">
        <SearchBar value={searchInput} onChangeText={setSearchInput} />
        <FilterChips
          options={[...MUSCLE_GROUPS]}
          selected={filters.muscleGroup}
          onSelect={setMuscleGroup}
          labelKey={(v) => t(`exercises.muscles.${v}`)}
        />
        <FilterChips
          options={[...EQUIPMENT]}
          selected={filters.equipment}
          onSelect={setEquipment}
          labelKey={(v) => t(`exercises.equipment.${v}`)}
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
              tintColor="#fff"
            />
          }
          contentContainerStyle={
            filteredExercises.length === 0 ? { flexGrow: 1 } : undefined
          }
        />
      </YStack>
    </SafeAreaView>
  )
}
