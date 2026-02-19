import { useState } from 'react'
import { Sheet, YStack, XStack, Input } from 'tamagui'
import { useTranslation } from 'react-i18next'

import type { ProgramExerciseWithExercise } from '@/hooks/usePrograms'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { colors } from '@/lib/theme'

interface EditExerciseTargetsModalProps {
  exercise: ProgramExerciseWithExercise | null
  open: boolean
  onClose: () => void
  onSave: (updates: {
    sets_target: number
    reps_target: number
    rpe_target: number | null
    rest_seconds: number | null
    notes: string | null
  }) => void
  isPending: boolean
}

function parseIntOrNull(value: string): number | null {
  const n = parseInt(value, 10)
  return isNaN(n) ? null : n
}

export function EditExerciseTargetsModal({
  exercise,
  open,
  onClose,
  onSave,
  isPending,
}: EditExerciseTargetsModalProps) {
  const { t } = useTranslation()

  const [setsTarget, setSetsTarget] = useState('')
  const [repsTarget, setRepsTarget] = useState('')
  const [rpeTarget, setRpeTarget] = useState('')
  const [restSeconds, setRestSeconds] = useState('')
  const [notes, setNotes] = useState('')

  // Reset form when exercise changes
  const [prevExerciseId, setPrevExerciseId] = useState<string | null>(null)
  if (exercise && exercise.id !== prevExerciseId) {
    setPrevExerciseId(exercise.id)
    setSetsTarget(String(exercise.sets_target))
    setRepsTarget(String(exercise.reps_target))
    setRpeTarget(exercise.rpe_target != null ? String(exercise.rpe_target) : '')
    setRestSeconds(exercise.rest_seconds != null ? String(exercise.rest_seconds) : '')
    setNotes(exercise.notes ?? '')
  }

  const sets = parseIntOrNull(setsTarget)
  const reps = parseIntOrNull(repsTarget)
  const rpe = parseIntOrNull(rpeTarget)
  const rest = parseIntOrNull(restSeconds)

  const isValid =
    sets != null && sets >= 1 && sets <= 20 &&
    reps != null && reps >= 1 && reps <= 100 &&
    (rpeTarget === '' || (rpe != null && rpe >= 1 && rpe <= 10)) &&
    (restSeconds === '' || (rest != null && rest >= 0 && rest <= 600))

  function handleSave() {
    if (!isValid || sets == null || reps == null) return
    onSave({
      sets_target: sets,
      reps_target: reps,
      rpe_target: rpeTarget === '' ? null : rpe,
      rest_seconds: restSeconds === '' ? null : rest,
      notes: notes.trim() || null,
    })
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) onClose()
      }}
      snapPointsMode="fit"
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame
        padding={16}
        gap={12}
        backgroundColor={colors.gray2}
        borderTopLeftRadius={16}
        borderTopRightRadius={16}
      >
        <AppText preset="pageTitle">
          {t('programs.editTargets')}
        </AppText>

        <XStack gap={12}>
          <YStack flex={1} gap={4}>
            <AppText preset="label" color={colors.gray7}>{t('programs.sets')}</AppText>
            <Input
              value={setsTarget}
              onChangeText={setSetsTarget}
              keyboardType="number-pad"
              backgroundColor={colors.gray3}
              borderWidth={1}
              borderColor={colors.gray5}
              color={colors.gray11}
              accessibilityLabel={t('programs.sets')}
            />
          </YStack>
          <YStack flex={1} gap={4}>
            <AppText preset="label" color={colors.gray7}>{t('programs.reps')}</AppText>
            <Input
              value={repsTarget}
              onChangeText={setRepsTarget}
              keyboardType="number-pad"
              backgroundColor={colors.gray3}
              borderWidth={1}
              borderColor={colors.gray5}
              color={colors.gray11}
              accessibilityLabel={t('programs.reps')}
            />
          </YStack>
        </XStack>

        <XStack gap={12}>
          <YStack flex={1} gap={4}>
            <AppText preset="label" color={colors.gray7}>{t('programs.targetRPE')}</AppText>
            <Input
              value={rpeTarget}
              onChangeText={setRpeTarget}
              keyboardType="number-pad"
              placeholder="—"
              backgroundColor={colors.gray3}
              borderWidth={1}
              borderColor={colors.gray5}
              color={colors.gray11}
              placeholderTextColor={colors.gray6 as any}
              accessibilityLabel={t('programs.targetRPE')}
            />
          </YStack>
          <YStack flex={1} gap={4}>
            <AppText preset="label" color={colors.gray7}>{t('programs.restSeconds')}</AppText>
            <Input
              value={restSeconds}
              onChangeText={setRestSeconds}
              keyboardType="number-pad"
              placeholder="—"
              backgroundColor={colors.gray3}
              borderWidth={1}
              borderColor={colors.gray5}
              color={colors.gray11}
              placeholderTextColor={colors.gray6 as any}
              accessibilityLabel={t('programs.restSeconds')}
            />
          </YStack>
        </XStack>

        <YStack gap={4}>
          <AppText preset="label" color={colors.gray7}>{t('workout.notes')}</AppText>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="—"
            backgroundColor={colors.gray3}
            borderWidth={1}
            borderColor={colors.gray5}
            color={colors.gray11}
            placeholderTextColor={colors.gray6 as any}
            accessibilityLabel={t('workout.notes')}
          />
        </YStack>

        <XStack gap={12} marginTop={8}>
          <YStack flex={1}>
            <AppButton
              variant="secondary"
              onPress={onClose}
              accessibilityLabel={t('common.cancel')}
            >
              {t('common.cancel')}
            </AppButton>
          </YStack>
          <YStack flex={1}>
            <AppButton
              variant="primary"
              onPress={handleSave}
              disabled={!isValid || isPending}
              loading={isPending}
              accessibilityLabel={t('common.save')}
            >
              {t('common.save')}
            </AppButton>
          </YStack>
        </XStack>
      </Sheet.Frame>
    </Sheet>
  )
}
