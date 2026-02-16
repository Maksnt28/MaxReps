import { XStack, Text, Input } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import type { WorkoutSet } from '@/stores/useWorkoutStore'

interface SetRowProps {
  set: WorkoutSet
  onUpdate: (updates: Partial<Pick<WorkoutSet, 'weightKg' | 'reps' | 'rpe'>>) => void
  onComplete: () => void
  onToggleWarmup: () => void
  onRemove: () => void
  suggestionType?: 'increase' | 'deload'
  suggestionHint?: string
}

function parseNumber(text: string): number | null {
  if (text === '') return null
  const n = parseFloat(text)
  return isNaN(n) ? null : n
}

export function SetRow({ set, onUpdate, onComplete, onToggleWarmup, onRemove, suggestionType, suggestionHint }: SetRowProps) {
  const { t } = useTranslation()

  return (
    <XStack
      alignItems="center"
      gap="$2"
      paddingVertical="$1.5"
      paddingHorizontal="$2"
      backgroundColor={set.isCompleted ? 'rgba(76, 175, 80, 0.1)' : 'transparent'}
      borderRadius="$2"
    >
      {/* Set number / warmup badge */}
      <TouchableOpacity
        onPress={onToggleWarmup}
        accessibilityLabel={t('workout.warmup')}
        accessibilityRole="togglebutton"
        accessibilityState={{ checked: set.isWarmup }}
        hitSlop={4}
      >
        <XStack
          width={32}
          height={32}
          borderRadius="$2"
          backgroundColor={set.isWarmup ? '$yellow4' : '$backgroundHover'}
          alignItems="center"
          justifyContent="center"
        >
          <Text
            color={set.isWarmup ? '$yellow10' : '$gray10'}
            fontSize={13}
            fontWeight="700"
          >
            {set.isWarmup ? t('workout.warmup') : set.setNumber}
          </Text>
        </XStack>
      </TouchableOpacity>

      {/* Weight input */}
      <Input
        flex={1}
        size="$3"
        keyboardType="decimal-pad"
        placeholder={t('workout.weight')}
        value={set.weightKg != null ? String(set.weightKg) : ''}
        onChangeText={(text) => onUpdate({ weightKg: parseNumber(text) })}
        textAlign="center"
        backgroundColor="$backgroundHover"
        borderWidth={undefined}
        borderTopWidth={0}
        borderRightWidth={0}
        borderBottomWidth={0}
        borderLeftWidth={suggestionType ? 3 : 0}
        borderLeftColor={suggestionType === 'increase' ? '$green8' : '$orange8'}
        color="$color"
        accessibilityLabel={t('workout.weight')}
        accessibilityHint={suggestionHint}
      />

      {/* Reps input */}
      <Input
        flex={1}
        size="$3"
        keyboardType="number-pad"
        placeholder={t('workout.reps')}
        value={set.reps != null ? String(set.reps) : ''}
        onChangeText={(text) => onUpdate({ reps: parseNumber(text) })}
        textAlign="center"
        backgroundColor="$backgroundHover"
        borderWidth={0}
        color="$color"
        accessibilityLabel={t('workout.reps')}
      />

      {/* RPE input */}
      <Input
        width={56}
        size="$3"
        keyboardType="decimal-pad"
        placeholder={t('workout.rpe')}
        value={set.rpe != null ? String(set.rpe) : ''}
        onChangeText={(text) => {
          const val = parseNumber(text)
          if (val != null && (val < 1 || val > 10)) return
          onUpdate({ rpe: val })
        }}
        textAlign="center"
        backgroundColor="$backgroundHover"
        borderWidth={0}
        color="$color"
        accessibilityLabel={t('workout.rpe')}
      />

      {/* Complete toggle */}
      <TouchableOpacity
        onPress={onComplete}
        accessibilityLabel={t('common.confirm')}
        accessibilityRole="togglebutton"
        accessibilityState={{ checked: set.isCompleted }}
        hitSlop={4}
      >
        <Ionicons
          name={set.isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
          size={28}
          color={set.isCompleted ? '#4CAF50' : '#555'}
        />
      </TouchableOpacity>

      {/* Remove set */}
      <TouchableOpacity
        onPress={onRemove}
        accessibilityLabel={t('workout.removeSet')}
        hitSlop={4}
      >
        <Ionicons name="close" size={18} color="#888" />
      </TouchableOpacity>
    </XStack>
  )
}
