import { Pressable, StyleSheet } from 'react-native'
import { YStack } from 'tamagui'
import { AppText } from '@/components/ui/AppText'
import { card, accent, radii, colors } from '@/lib/theme'

interface SelectionCardProps {
  label: string
  description?: string
  selected: boolean
  compact?: boolean
  onPress: () => void
  accessibilityLabel?: string
}

export function SelectionCard({
  label,
  description,
  selected,
  compact = false,
  onPress,
  accessibilityLabel,
}: SelectionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        compact ? styles.compactBase : styles.base,
        {
          backgroundColor: selected ? 'rgba(59,130,246,0.1)' : card.dark.background,
          borderColor: selected ? accent.accent : card.dark.border,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {compact ? (
        <AppText
          preset="caption"
          color={selected ? accent.accent : colors.gray11}
          textAlign="center"
        >
          {label}
        </AppText>
      ) : (
        <YStack gap={4}>
          <AppText preset="exerciseName" color={selected ? accent.accent : colors.gray11}>
            {label}
          </AppText>
          {description && (
            <AppText preset="caption" color={colors.gray7}>
              {description}
            </AppText>
          )}
        </YStack>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radii.card,
    padding: 16,
  },
  compactBase: {
    borderWidth: 1,
    borderRadius: radii.button,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
})
