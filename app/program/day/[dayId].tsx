import { useCallback, useMemo, useState } from 'react'
import { Alert, Keyboard, Pressable, View, TouchableOpacity, StyleSheet } from 'react-native'
import { YStack, Input, Spinner } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import ReorderableList, {
  reorderItems,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list'

import {
  useProgram,
  useUpsertProgramDay,
  useDeleteProgramDay,
  useUpdateProgramExercise,
  useDeleteProgramExercise,
  useReorderProgramExercises,
  type ProgramExerciseWithExercise,
} from '@/hooks/usePrograms'
import { ProgramExerciseRow } from '@/components/program/ProgramExerciseRow'
import { EditExerciseTargetsModal } from '@/components/program/EditExerciseTargetsModal'
import { EmptyState } from '@/components/EmptyState'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { colors, headerButtonStyles, headerButtonIcon } from '@/lib/theme'

export default function DayDetailScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const locale = i18n.language
  const { dayId, programId } = useLocalSearchParams<{
    dayId: string
    programId: string
  }>()

  const { data: program, isLoading, refetch } = useProgram(programId!)

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch]),
  )

  const upsertDay = useUpsertProgramDay()
  const deleteDay = useDeleteProgramDay()
  const updateExercise = useUpdateProgramExercise()
  const deleteExercise = useDeleteProgramExercise()
  const reorderExercises = useReorderProgramExercises()

  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [editingFocus, setEditingFocus] = useState(false)
  const [focusValue, setFocusValue] = useState('')
  const [editModalExercise, setEditModalExercise] =
    useState<ProgramExerciseWithExercise | null>(null)

  const day = useMemo(
    () => program?.program_days.find((d) => d.id === dayId) ?? null,
    [program, dayId],
  )

  const exercises = day?.program_exercises ?? []

  function handleNameBlur() {
    setEditingName(false)
    if (!day) return
    const trimmed = nameValue.trim()
    if (trimmed && trimmed !== day.name) {
      upsertDay.mutate({
        id: day.id,
        programId: programId!,
        name: trimmed,
        dayNumber: day.day_number,
        focus: day.focus,
      })
    }
  }

  function handleFocusBlur() {
    setEditingFocus(false)
    if (!day) return
    const trimmed = focusValue.trim()
    if (trimmed !== (day.focus ?? '')) {
      upsertDay.mutate({
        id: day.id,
        programId: programId!,
        name: day.name,
        dayNumber: day.day_number,
        focus: trimmed || null,
      })
    }
  }

  function handleDeleteDay() {
    Alert.alert(
      t('programs.deleteDay'),
      t('programs.deleteDayConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteDay.mutateAsync({ id: dayId!, programId: programId! })
            router.back()
          },
        },
      ],
    )
  }

  function handleRemoveExercise(exerciseId: string) {
    Alert.alert(
      t('programs.removeExercise'),
      t('programs.removeExerciseConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteExercise.mutate({ id: exerciseId, programId: programId! })
          },
        },
      ],
    )
  }

  function handleReorder({ from, to }: ReorderableListReorderEvent) {
    const reordered = reorderItems(exercises, from, to)
    reorderExercises.mutate({
      programId: programId!,
      exercises: reordered.map((e, i) => ({ id: e.id, order: i })),
    })
  }

  function handleSaveTargets(updates: {
    sets_target: number
    reps_target: number
    rpe_target: number | null
    rest_seconds: number | null
    notes: string | null
  }) {
    if (!editModalExercise) return
    updateExercise.mutate(
      {
        id: editModalExercise.id,
        programId: programId!,
        updates,
      },
      { onSuccess: () => setEditModalExercise(null) },
    )
  }

  if (isLoading || !day) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor={colors.gray1}
      >
        <Spinner size="large" color={colors.gray11} />
      </YStack>
    )
  }

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss} accessible={false}>
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

        <YStack flex={1}>
          <YStack padding={16} gap={8}>
            {editingName ? (
              <Input
                value={nameValue}
                onChangeText={setNameValue}
                onBlur={handleNameBlur}
                onSubmitEditing={handleNameBlur}
                autoFocus
                maxLength={100}
                fontSize={24}
                fontWeight="700"
                backgroundColor={colors.gray3}
                borderWidth={1}
                borderColor={colors.gray5}
                color={colors.gray12}
                accessibilityLabel={t('programs.dayName')}
              />
            ) : (
              <AppText
                preset="pageTitle"
                onPress={() => {
                  setNameValue(day.name)
                  setEditingName(true)
                }}
                accessibilityLabel={day.name}
              >
                {day.name}
              </AppText>
            )}

            {editingFocus ? (
              <Input
                value={focusValue}
                onChangeText={setFocusValue}
                onBlur={handleFocusBlur}
                onSubmitEditing={handleFocusBlur}
                autoFocus
                maxLength={100}
                placeholder={t('programs.dayFocusPlaceholder')}
                backgroundColor={colors.gray3}
                borderWidth={1}
                borderColor={colors.gray5}
                color={colors.gray12}
                placeholderTextColor={colors.gray6 as any}
                accessibilityLabel={t('programs.dayFocus')}
              />
            ) : (
              <AppText
                preset="label"
                color={colors.gray7}
                onPress={() => {
                  setFocusValue(day.focus ?? '')
                  setEditingFocus(true)
                }}
                accessibilityLabel={t('programs.dayFocus')}
              >
                {day.focus || t('programs.dayFocusPlaceholder')}
              </AppText>
            )}
          </YStack>

          <ReorderableList
            style={{ flex: 1 }}
            data={exercises}
            keyExtractor={(item) => item.id}
            keyboardDismissMode="on-drag"
            onReorder={handleReorder}
            shouldUpdateActiveItem
            renderItem={({ item }) => (
              <ProgramExerciseRow
                exercise={item}
                locale={locale}
                onPress={() => setEditModalExercise(item)}
                onRemove={() => handleRemoveExercise(item.id)}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                title={t('programs.noExercises')}
                message={t('programs.noExercisesMessage')}
              />
            }
            contentContainerStyle={
              exercises.length === 0 ? { flexGrow: 1 } : undefined
            }
          />

          <YStack padding={16} gap={12}>
            <AppButton
              variant="primary"
              onPress={() =>
                router.push(
                  `/program/add-exercise?dayId=${dayId}&programId=${programId}`,
                )
              }
              accessibilityLabel={t('workout.addExercise')}
            >
              {t('workout.addExercise')}
            </AppButton>
            <AppButton
              variant="destructive"
              onPress={handleDeleteDay}
              disabled={deleteDay.isPending}
              accessibilityLabel={t('programs.deleteDay')}
            >
              {t('programs.deleteDay')}
            </AppButton>
          </YStack>

          <EditExerciseTargetsModal
            exercise={editModalExercise}
            open={editModalExercise !== null}
            onClose={() => setEditModalExercise(null)}
            onSave={handleSaveTargets}
            isPending={updateExercise.isPending}
          />
        </YStack>
      </View>
    </Pressable>
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
