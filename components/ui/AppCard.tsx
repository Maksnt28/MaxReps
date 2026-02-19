import { StyleSheet } from 'react-native'
import { YStack } from 'tamagui'
import type { YStackProps } from 'tamagui'
import { BlurView } from 'expo-blur'
import { card, radii, accent, semantic } from '@/lib/theme'
import { AccentBar } from './AccentBar'

type CardVariant = 'default' | 'active' | 'pr' | 'interactive'

interface AppCardProps extends YStackProps {
  variant?: CardVariant
  compact?: boolean
  blur?: boolean
  onPress?: () => void
  children: React.ReactNode
}

const accentBarColors: Partial<Record<CardVariant, string>> = {
  active: accent.accent,
  pr: semantic.pr,
}

export function AppCard({
  variant = 'default',
  compact = false,
  blur = false,
  onPress,
  children,
  ...props
}: AppCardProps) {
  const accentBarColor = accentBarColors[variant]
  const isInteractive = variant === 'interactive'

  return (
    <YStack
      backgroundColor={card.dark.background}
      borderWidth={1}
      borderColor={card.dark.border}
      borderRadius={radii.card}
      padding={compact ? 8 : 11}
      paddingHorizontal={compact ? 11 : 13}
      overflow="hidden"
      {...(isInteractive && {
        pressStyle: { opacity: 0.8, scale: 0.98 },
        cursor: 'pointer',
      })}
      onPress={onPress}
      {...props}
    >
      {/* Glassmorphism blur layer */}
      {blur && (
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      )}

      {/* Top edge highlight */}
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        height={1}
        backgroundColor={card.dark.topEdge}
      />

      {accentBarColor && <AccentBar color={accentBarColor} />}

      {children}
    </YStack>
  )
}
