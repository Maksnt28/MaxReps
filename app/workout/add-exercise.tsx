import { useMemo, useState } from 'react'
import { FlatList, Pressable } from 'react-native'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter, Stack } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useExercises } from '@/hooks/useExercises'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { filterExercises, getLocalizedExercise } from '@/lib/exercises'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { SearchBar } from '@/components/SearchBar'
import { FilterChips } from '@/components/FilterChips'
import { EmptyState } from '@/components/EmptyState'
import { EXERCISE_LIST_ITEM_HEIGHT } from '@/components/ExerciseListItem'
import type { Exercise } from '@/hooks/useExercises'

const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'quads', 'hamstrings', 'glutes', 'calves', 'abs',
] as const

const EQUIPMENT = [
  'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'bands', 'kettlebell',
] as const

export default function AddExerciseScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const locale = i18n.language

  const { data: exercises, isLoading, error, refetch } = useExercises()
  const workoutExercises = useWorkoutStore((s) => s.exercises)
  const addExercise = useWorkoutStore((s) => s.addExercise)

  const alreadyAddedIds = useMemo(
    () => new Set(workoutExercises.map((e) => e.exerciseId)),
    [workoutExercises],
  )

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchInput, setSearchInput] = useState('')
  const [muscleGroup, setMuscleGroup] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(searchInput, 150)

  const filteredExercises = useMemo(() => {
    if (!exercises) return []
    return filterExercises(
      exercises,
      { search: debouncedSearch, muscleGroup, equipment },
      locale,
    )
  }, [exercises, debouncedSearch, muscleGroup, equipment, locale])

  const selectionCount = selectedIds.size

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleAdd() {
    for (const id of selectedIds) {
      addExercise(id)
    }
    router.back()
  }

  function clearFilters() {
    setSearchInput('')
    setMuscleGroup(null)
    setEquipment(null)
  }

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Spinner size="large" color="$color" />
      </YStack>
    )
  }

  if (error) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background" gap="$3">
        <Text color="$color" fontSize={16}>{t('common.error')}</Text>
        <Button onPress={() => refetch()} accessibilityLabel={t('common.retry')}>
          {t('common.retry')}
        </Button>
      </YStack>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () =>
            selectionCount > 0 ? (
              <Button
                size="$3"
                backgroundColor="$color"
                onPress={handleAdd}
                accessibilityLabel={t('workout.addExercises', { count: selectionCount })}
              >
                <Text color="$background" fontWeight="600">
                  {t('workout.addExercises', { count: selectionCount })}
                </Text>
              </Button>
            ) : null,
        }}
      />
      <YStack flex={1} backgroundColor="$background">
        <SearchBar value={searchInput} onChangeText={setSearchInput} />
        <FilterChips
          options={[...MUSCLE_GROUPS]}
          selected={muscleGroup}
          onSelect={setMuscleGroup}
          labelKey={(v) => t(`exercises.muscles.${v}`)}
        />
        <FilterChips
          options={[...EQUIPMENT]}
          selected={equipment}
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
            <SelectableExerciseItem
              exercise={item}
              locale={locale}
              isSelected={selectedIds.has(item.id)}
              isAlreadyAdded={alreadyAddedIds.has(item.id)}
              onToggle={() => toggleSelection(item.id)}
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
          contentContainerStyle={
            filteredExercises.length === 0 ? { flex: 1 } : undefined
          }
        />
      </YStack>
    </>
  )
}

function SelectableExerciseItem({
  exercise,
  locale,
  isSelected,
  isAlreadyAdded,
  onToggle,
}: {
  exercise: Exercise
  locale: string
  isSelected: boolean
  isAlreadyAdded: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const { name } = getLocalizedExercise(exercise, locale)
  const muscleLabel = t(`exercises.muscles.${exercise.muscle_primary}`)
  const equipmentLabel = t(`exercises.equipment.${exercise.equipment}`)

  return (
    <Pressable
      onPress={isAlreadyAdded ? undefined : onToggle}
      accessibilityLabel={
        isAlreadyAdded
          ? `${name}, ${t('workout.alreadyAdded')}`
          : `${name}, ${muscleLabel}`
      }
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected, disabled: isAlreadyAdded }}
    >
      <XStack
        height={EXERCISE_LIST_ITEM_HEIGHT}
        alignItems="center"
        paddingHorizontal="$3"
        gap="$3"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        opacity={isAlreadyAdded ? 0.4 : 1}
      >
        <YStack width={28} alignItems="center" justifyContent="center">
          {isAlreadyAdded ? (
            <Ionicons name="checkmark-circle" size={24} color="#555" />
          ) : isSelected ? (
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color="#555" />
          )}
        </YStack>
        <YStack flex={1} gap="$1">
          <Text color="$color" fontSize={16} fontWeight="500" numberOfLines={1}>
            {name}
          </Text>
          <XStack gap="$2" alignItems="center">
            <Text color="$gray10" fontSize={12}>{muscleLabel}</Text>
            <Text color="$gray10" fontSize={10}>{'·'}</Text>
            <Text color="$gray10" fontSize={12}>{equipmentLabel}</Text>
          </XStack>
        </YStack>
      </XStack>
    </Pressable>
  )
}
