import { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Keyboard, Pressable, RefreshControl } from 'react-native'
import { YStack, XStack, Text, Input, Button, Spinner } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'

import {
  useProgram,
  useUpdateProgram,
  useDeleteProgram,
  useUpsertProgramDay,
  type ProgramDayWithExercises,
} from '@/hooks/usePrograms'
import { useCreateSession } from '@/hooks/useWorkoutMutations'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { ProgramDayCard } from '@/components/program/ProgramDayCard'
import { EmptyState } from '@/components/EmptyState'

export default function ProgramDetailScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: program, isLoading, refetch } = useProgram(id!)

  useFocusEffect(useCallback(() => { refetch() }, [refetch]))

  const updateProgram = useUpdateProgram()
  const deleteProgram = useDeleteProgram()
  const upsertDay = useUpsertProgramDay()
  const createSession = useCreateSession()

  const isActive = useWorkoutStore((s) => s.isActive)
  const startWorkout = useWorkoutStore((s) => s.startWorkout)
  const loadProgramDay = useWorkoutStore((s) => s.loadProgramDay)
  const endWorkout = useWorkoutStore((s) => s.endWorkout)

  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')

  // Redirect if program was deleted
  useEffect(() => {
    if (!isLoading && program === null) {
      router.replace('/(tabs)/programs')
    }
  }, [isLoading, program, router])

  function handleNameBlur() {
    setEditingName(false)
    const trimmed = nameValue.trim()
    if (trimmed && trimmed !== program?.name) {
      updateProgram.mutate({ id: id!, name: trimmed })
    }
  }

  function handleAddDay() {
    if (!program) return
    const nextDayNumber = program.program_days.length > 0
      ? Math.max(...program.program_days.map((d) => d.day_number)) + 1
      : 1
    upsertDay.mutate({
      programId: id!,
      name: t('programs.dayDefault', { number: nextDayNumber }),
      dayNumber: nextDayNumber,
    })
  }

  function handleDeleteProgram() {
    Alert.alert(
      t('programs.deleteProgram'),
      t('programs.deleteProgramConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteProgram.mutateAsync(id!)
            router.replace('/(tabs)/programs')
          },
        },
      ]
    )
  }

  function handleStartWorkout(day: ProgramDayWithExercises) {
    const doStart = async () => {
      try {
        if (isActive) {
          endWorkout()
        }
        const session = await createSession.mutateAsync({ programDayId: day.id })
        startWorkout(session.id, day.id)
        loadProgramDay(
          day.program_exercises.map((pe) => ({
            exerciseId: pe.exercise_id,
            setsTarget: pe.sets_target,
          }))
        )
        router.push('/(tabs)/workout')
      } catch {
        Alert.alert(t('programs.startWorkoutError'))
      }
    }

    if (isActive) {
      Alert.alert(
        t('programs.activeWorkoutTitle'),
        t('programs.activeWorkoutMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('programs.discardAndStart'),
            style: 'destructive',
            onPress: doStart,
          },
        ]
      )
    } else {
      doStart()
    }
  }

  if (isLoading || !program) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
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
            accessibilityLabel={t('programs.name')}
          />
        ) : (
          <Text
            color="$color"
            fontSize={24}
            fontWeight="700"
            onPress={() => {
              setNameValue(program.name)
              setEditingName(true)
            }}
            accessibilityLabel={program.name}
          >
            {program.name}
          </Text>
        )}
      </YStack>

      <FlatList
        style={{ flex: 1 }}
        keyboardDismissMode="on-drag"
        data={program.program_days}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProgramDayCard
            day={item}
            onPress={() =>
              router.push(`/program/day/${item.id}?programId=${id}`)
            }
            onStartWorkout={() => handleStartWorkout(item)}
            startWorkoutDisabled={createSession.isPending}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title={t('programs.noDays')}
            message={t('programs.noDaysMessage')}
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
          program.program_days.length === 0 ? { flexGrow: 1 } : undefined
        }
      />

      <YStack padding="$4" gap="$3">
        <Button
          onPress={handleAddDay}
          disabled={upsertDay.isPending}
          opacity={upsertDay.isPending ? 0.5 : 1}
          accessibilityLabel={t('programs.addDay')}
          icon={<Ionicons name="add" size={20} color="#fff" />}
        >
          {t('programs.addDay')}
        </Button>
        <Button
          variant="outlined"
          onPress={handleDeleteProgram}
          disabled={deleteProgram.isPending}
          accessibilityLabel={t('programs.deleteProgram')}
        >
          <XStack gap="$2" alignItems="center">
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text color="$red10">{t('programs.deleteProgram')}</Text>
          </XStack>
        </Button>
      </YStack>
    </YStack>
    </Pressable>
  )
}
