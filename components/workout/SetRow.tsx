import { XStack, YStack, Input } from 'tamagui'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'
import { LinearGradient } from 'expo-linear-gradient'

import type { WorkoutSet } from '@/stores/useWorkoutStore'
import { AppText } from '@/components/ui/AppText'
import { colors, checkmark, radii, overload } from '@/lib/theme'
import { hapticLight } from '@/lib/animations'

interface SetRowProps {
  set: WorkoutSet
  isCurrent?: boolean
  onUpdate: (updates: Partial<Pick<WorkoutSet, 'weightKg' | 'reps' | 'rpe'>>) => void
  onComplete: () => void
  onToggleWarmup: () => void
  onRemove: () => void
  suggestionType?: 'increase' | 'deload'
  suggestionHint?: string
  ghostWeight?: number | null
  ghostReps?: number | null
}

function parseNumber(text: string): number | null {
  if (text === '') return null
  const n = parseFloat(text)
  return isNaN(n) ? null : n
}

export function SetRow({
  set,
  isCurrent = false,
  onUpdate,
  onComplete,
  onToggleWarmup,
  onRemove,
  suggestionType,
  suggestionHint,
  ghostWeight,
  ghostReps,
}: SetRowProps) {
  const { t } = useTranslation()
  const isCompleted = set.isCompleted

  return (
    <XStack
      alignItems="center"
      gap={8}
      paddingVertical={6}
      paddingHorizontal={8}
      borderRadius={isCurrent ? radii.activeRow : 0}
      opacity={isCompleted ? 0.55 : 1}
      overflow="hidden"
    >
      {/* Active row gradient background */}
      {isCurrent && (
        <LinearGradient
          colors={['rgba(59,130,246,0.10)', 'rgba(59,130,246,0.02)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Active indicator bar */}
      {isCurrent && (
        <YStack
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          width={2}
          backgroundColor={colors.accent}
          borderRadius={1}
        />
      )}

      {/* Set number / warmup badge */}
      <TouchableOpacity
        onPress={onToggleWarmup}
        accessibilityLabel={t('workout.warmup')}
        accessibilityRole="togglebutton"
        accessibilityState={{ checked: set.isWarmup }}
        hitSlop={4}
      >
        <XStack
          width={28}
          height={28}
          borderRadius={radii.chip}
          backgroundColor={set.isWarmup ? 'rgba(255,215,0,0.15)' : colors.gray3}
          alignItems="center"
          justifyContent="center"
        >
          <AppText
            preset="chipLabel"
            color={set.isWarmup ? '#FFD700' : isCurrent ? colors.accent : colors.gray7}
          >
            {set.isWarmup ? 'W' : set.setNumber}
          </AppText>
        </XStack>
      </TouchableOpacity>

      {/* Weight input */}
      <YStack flex={1}>
        <Input
          size="$3"
          keyboardType="decimal-pad"
          placeholder={ghostWeight != null ? `(${ghostWeight})` : t('workout.weight')}
          value={set.weightKg != null ? String(set.weightKg) : ''}
          onChangeText={(text) => onUpdate({ weightKg: parseNumber(text) })}
          textAlign="center"
          backgroundColor={colors.gray2}
          borderWidth={undefined}
          borderTopWidth={0}
          borderRightWidth={0}
          borderBottomWidth={0}
          borderLeftWidth={suggestionType ? 3 : 0}
          borderLeftColor={
            suggestionType === 'increase' ? overload.increase : overload.deload
          }
          color={isCurrent ? colors.accent : colors.gray11}
          fontWeight="700"
          fontSize={15}
          placeholderTextColor={colors.gray4 as any}
          accessibilityLabel={t('workout.weight')}
          accessibilityHint={suggestionHint}
        />
      </YStack>

      {/* Reps input */}
      <YStack flex={1}>
        <Input
          size="$3"
          keyboardType="number-pad"
          placeholder={ghostReps != null ? `(${ghostReps})` : t('workout.reps')}
          value={set.reps != null ? String(set.reps) : ''}
          onChangeText={(text) => onUpdate({ reps: parseNumber(text) })}
          textAlign="center"
          backgroundColor={colors.gray2}
          borderWidth={0}
          color={colors.gray11}
          fontWeight="700"
          fontSize={15}
          placeholderTextColor={colors.gray4 as any}
          accessibilityLabel={t('workout.reps')}
        />
      </YStack>

      {/* RPE input */}
      <Input
        width={50}
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
        backgroundColor={colors.gray2}
        borderWidth={0}
        color={colors.gray11}
        fontSize={13}
        placeholderTextColor={colors.gray7 as any}
        accessibilityLabel={t('workout.rpe')}
      />

      {/* Complete toggle — neutral checkmark, NEVER green */}
      <TouchableOpacity
        onPress={() => { hapticLight(); onComplete() }}
        accessibilityLabel={t('common.confirm')}
        accessibilityRole="togglebutton"
        accessibilityState={{ checked: isCompleted }}
        hitSlop={4}
      >
        <XStack
          width={28}
          height={28}
          borderRadius={radii.check}
          backgroundColor={isCompleted ? checkmark.dark.bg : colors.gray3}
          borderWidth={isCompleted ? 0 : 1.5}
          borderColor={isCompleted ? undefined : colors.gray5}
          alignItems="center"
          justifyContent="center"
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={16} color={checkmark.dark.fg} />
          ) : (
            <Ionicons name="checkmark" size={14} color={colors.gray5} />
          )}
        </XStack>
      </TouchableOpacity>

      {/* Remove set */}
      <TouchableOpacity
        onPress={onRemove}
        accessibilityLabel={t('workout.removeSet')}
        hitSlop={4}
      >
        <Ionicons name="close" size={16} color={colors.gray6} />
      </TouchableOpacity>
    </XStack>
  )
}
