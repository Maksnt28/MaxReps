import { Pressable, StyleSheet } from 'react-native'
import { XStack } from 'tamagui'
import { AppText } from './AppText'
import { accent, radii } from '@/lib/theme'

interface PillSelectorProps {
  options: { value: string; label: string }[]
  selected: string | null
  onSelect: (value: string) => void
  disabled?: boolean
  accessibilityLabel: string
}

export function PillSelector({
  options,
  selected,
  onSelect,
  disabled = false,
  accessibilityLabel,
}: PillSelectorProps) {
  return (
    <XStack gap={8} flexWrap="wrap" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const isSelected = option.value === selected
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            disabled={disabled}
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled }}
            style={[
              styles.pill,
              isSelected && styles.pillSelected,
              disabled && styles.pillDisabled,
            ]}
          >
            <AppText
              preset="caption"
              color={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
            >
              {option.label}
            </AppText>
          </Pressable>
        )
      })}
    </XStack>
  )
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.button,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: accent.accent,
  },
  pillDisabled: {
    opacity: 0.5,
  },
})
