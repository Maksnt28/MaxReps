import { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Keyboard, Pressable, RefreshControl, View, TouchableOpacity, StyleSheet } from 'react-native'
import { YStack, Input, Spinner } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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
import { useRestTimerStore } from '@/stores/useRestTimerStore'
import { ProgramDayCard } from '@/components/program/ProgramDayCard'
import { EmptyState } from '@/components/EmptyState'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { colors, headerButtonStyles, headerButtonIcon } from '@/lib/theme'

export default function ProgramDetailScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
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
  const resetTimer = useRestTimerStore((s) => s.reset)

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
        resetTimer()
        const session = await createSession.mutateAsync({ programDayId: day.id })
        startWorkout(session.id, day.id)
        loadProgramDay(
          day.program_exercises.map((pe) => ({
            exerciseId: pe.exercise_id,
            setsTarget: pe.sets_target,
            repsTarget: pe.reps_target,
            restSeconds: pe.rest_seconds,
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
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={colors.gray1}>
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
              accessibilityLabel={t('programs.name')}
            />
          ) : (
            <AppText
              preset="pageTitle"
              onPress={() => {
                setNameValue(program.name)
                setEditingName(true)
              }}
              accessibilityLabel={program.name}
            >
              {program.name}
            </AppText>
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
              tintColor={colors.gray11}
            />
          }
          contentContainerStyle={
            program.program_days.length === 0
              ? { flexGrow: 1 }
              : { paddingHorizontal: 12, gap: 8, paddingBottom: 80 }
          }
        />

        <YStack padding={16} gap={12}>
          <AppButton
            variant="primary"
            onPress={handleAddDay}
            disabled={upsertDay.isPending}
            accessibilityLabel={t('programs.addDay')}
          >
            {t('programs.addDay')}
          </AppButton>
          <AppButton
            variant="destructive"
            onPress={handleDeleteProgram}
            disabled={deleteProgram.isPending}
            accessibilityLabel={t('programs.deleteProgram')}
          >
            {t('programs.deleteProgram')}
          </AppButton>
        </YStack>
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
