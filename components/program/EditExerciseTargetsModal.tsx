import { useState } from 'react'
import { Sheet, YStack, XStack, Text, Input, Button } from 'tamagui'
import { useTranslation } from 'react-i18next'

import type { ProgramExerciseWithExercise } from '@/hooks/usePrograms'

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
      <Sheet.Frame padding="$4" gap="$3">
        <Text color="$color" fontSize={18} fontWeight="600">
          {t('programs.editTargets')}
        </Text>

        <XStack gap="$3">
          <YStack flex={1} gap="$1">
            <Text color="$gray10" fontSize={13}>{t('programs.sets')}</Text>
            <Input
              value={setsTarget}
              onChangeText={setSetsTarget}
              keyboardType="number-pad"
              accessibilityLabel={t('programs.sets')}
            />
          </YStack>
          <YStack flex={1} gap="$1">
            <Text color="$gray10" fontSize={13}>{t('programs.reps')}</Text>
            <Input
              value={repsTarget}
              onChangeText={setRepsTarget}
              keyboardType="number-pad"
              accessibilityLabel={t('programs.reps')}
            />
          </YStack>
        </XStack>

        <XStack gap="$3">
          <YStack flex={1} gap="$1">
            <Text color="$gray10" fontSize={13}>{t('programs.targetRPE')}</Text>
            <Input
              value={rpeTarget}
              onChangeText={setRpeTarget}
              keyboardType="number-pad"
              placeholder="—"
              accessibilityLabel={t('programs.targetRPE')}
            />
          </YStack>
          <YStack flex={1} gap="$1">
            <Text color="$gray10" fontSize={13}>{t('programs.restSeconds')}</Text>
            <Input
              value={restSeconds}
              onChangeText={setRestSeconds}
              keyboardType="number-pad"
              placeholder="—"
              accessibilityLabel={t('programs.restSeconds')}
            />
          </YStack>
        </XStack>

        <YStack gap="$1">
          <Text color="$gray10" fontSize={13}>{t('workout.notes')}</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="—"
            accessibilityLabel={t('workout.notes')}
          />
        </YStack>

        <XStack gap="$3" marginTop="$2">
          <Button
            flex={1}
            variant="outlined"
            onPress={onClose}
            accessibilityLabel={t('common.cancel')}
          >
            {t('common.cancel')}
          </Button>
          <Button
            flex={1}
            backgroundColor="$color"
            onPress={handleSave}
            disabled={!isValid || isPending}
            opacity={!isValid || isPending ? 0.5 : 1}
            accessibilityLabel={t('common.save')}
          >
            <Text color="$background" fontWeight="600">
              {t('common.save')}
            </Text>
          </Button>
        </XStack>
      </Sheet.Frame>
    </Sheet>
  )
}
