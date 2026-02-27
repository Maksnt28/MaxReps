import { useMemo, useState } from 'react'
import { FlatList, Pressable, TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { YStack, XStack, Spinner } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useExercises } from '@/hooks/useExercises'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { filterExercises, getLocalizedExercise, MUSCLE_GROUPS, EQUIPMENT } from '@/lib/exercises'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { SearchBar } from '@/components/SearchBar'
import { FilterButtons } from '@/components/FilterButtons'
import { EmptyState } from '@/components/EmptyState'
import { EXERCISE_LIST_ITEM_HEIGHT } from '@/components/ExerciseListItem'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { colors, separator, headerButtonStyles, headerButtonIcon } from '@/lib/theme'
import { hapticLight } from '@/lib/animations'
import type { Exercise } from '@/hooks/useExercises'

export default function AddExerciseScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
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
    hapticLight()
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
    hapticLight()
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
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={colors.gray1}>
        <Spinner size="large" color={colors.gray11} />
      </YStack>
    )
  }

  if (error) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={colors.gray1} gap={12}>
        <AppText preset="body">{t('common.error')}</AppText>
        <AppButton variant="secondary" onPress={() => refetch()} accessibilityLabel={t('common.retry')}>
          {t('common.retry')}
        </AppButton>
      </YStack>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel={t('common.cancel')}
          hitSlop={8}
          style={headerButtonStyles.navButton}
        >
          <Ionicons name="close" size={headerButtonIcon.size} color={headerButtonIcon.color} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('workout.addExercise')}
        </Text>

        {selectionCount > 0 ? (
          <TouchableOpacity
            onPress={handleAdd}
            activeOpacity={0.8}
            style={headerButtonStyles.actionButton}
            accessibilityLabel={t('workout.addExercises', { count: selectionCount })}
          >
            <Text style={styles.actionButtonText}>
              {t('workout.addExercises', { count: selectionCount })}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

      <SearchBar value={searchInput} onChangeText={setSearchInput} />
      <FilterButtons
        muscleGroup={muscleGroup}
        equipment={equipment}
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
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    color: colors.gray12,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerPlaceholder: {
    width: 32,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
})

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
        paddingHorizontal={12}
        gap={12}
        borderBottomWidth={1}
        borderBottomColor={separator.neutral.dark}
        opacity={isAlreadyAdded ? 0.4 : 1}
      >
        <YStack width={28} alignItems="center" justifyContent="center">
          {isAlreadyAdded ? (
            <Ionicons name="checkmark-circle" size={24} color={colors.gray6} />
          ) : isSelected ? (
            <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color={colors.gray6} />
          )}
        </YStack>
        <YStack flex={1} gap={4}>
          <AppText preset="exerciseName" color={colors.gray11} numberOfLines={1}>
            {name}
          </AppText>
          <XStack gap={8} alignItems="center">
            <AppText preset="caption" color={colors.gray7}>{muscleLabel}</AppText>
            <AppText preset="caption" color={colors.gray6}>{'·'}</AppText>
            <AppText preset="caption" color={colors.gray7}>{equipmentLabel}</AppText>
          </XStack>
        </YStack>
      </XStack>
    </Pressable>
  )
}
