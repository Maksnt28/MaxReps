import { useCallback, useMemo, useState } from 'react'
import { Alert, Keyboard, Pressable } from 'react-native'
import { YStack, XStack, Text, Input, Button, Spinner } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
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

export default function DayDetailScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
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
        backgroundColor="$background"
      >
        <Spinner size="large" color="$color" />
      </YStack>
    )
  }

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss} accessible={false}>
      <YStack flex={1} backgroundColor="$background">
        <YStack padding="$4" gap="$2">
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
              accessibilityLabel={t('programs.dayName')}
            />
          ) : (
            <Text
              color="$color"
              fontSize={24}
              fontWeight="700"
              onPress={() => {
                setNameValue(day.name)
                setEditingName(true)
              }}
              accessibilityLabel={day.name}
            >
              {day.name}
            </Text>
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
              accessibilityLabel={t('programs.dayFocus')}
            />
          ) : (
            <Text
              color="$gray10"
              fontSize={14}
              onPress={() => {
                setFocusValue(day.focus ?? '')
                setEditingFocus(true)
              }}
              accessibilityLabel={t('programs.dayFocus')}
            >
              {day.focus || t('programs.dayFocusPlaceholder')}
            </Text>
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

        <YStack padding="$4" gap="$3">
          <Button
            onPress={() =>
              router.push(
                `/program/add-exercise?dayId=${dayId}&programId=${programId}`,
              )
            }
            accessibilityLabel={t('workout.addExercise')}
            icon={<Ionicons name="add" size={20} color="#fff" />}
          >
            {t('workout.addExercise')}
          </Button>
          <Button
            variant="outlined"
            onPress={handleDeleteDay}
            disabled={deleteDay.isPending}
            accessibilityLabel={t('programs.deleteDay')}
          >
            <XStack gap="$2" alignItems="center">
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
              <Text color="$red10">{t('programs.deleteDay')}</Text>
            </XStack>
          </Button>
        </YStack>

        <EditExerciseTargetsModal
          exercise={editModalExercise}
          open={editModalExercise !== null}
          onClose={() => setEditModalExercise(null)}
          onSave={handleSaveTargets}
          isPending={updateExercise.isPending}
        />
      </YStack>
    </Pressable>
  )
}
