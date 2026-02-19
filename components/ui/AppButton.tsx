import { Pressable, StyleSheet } from 'react-native'
import { Spinner, XStack } from 'tamagui'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors, radii } from '@/lib/theme'
import { AppText } from './AppText'

const variants = {
  primary: {
    bg: colors.accent,
    text: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  secondary: {
    bg: 'transparent',
    text: colors.accent,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  ghost: {
    bg: 'transparent',
    text: colors.accent,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  destructive: {
    bg: colors.regression,
    text: '#FFFFFF',
    borderWidth: 0,
    borderColor: 'transparent',
  },
} as const

export type ButtonVariant = keyof typeof variants

interface AppButtonProps {
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  onPress?: () => void
  fullWidth?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  accessibilityLabel?: string
  children: React.ReactNode
}

export function AppButton({
  variant = 'primary',
  loading = false,
  disabled,
  onPress,
  fullWidth = false,
  icon,
  accessibilityLabel,
  children,
}: AppButtonProps) {
  const v = variants[variant]
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderWidth: v.borderWidth,
          borderColor: v.borderColor,
          opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        fullWidth && styles.fullWidth,
      ]}
    >
      <XStack alignItems="center" justifyContent="center" gap={8}>
        {loading ? (
          <Spinner size="small" color={v.text} />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={18} color={v.text} />}
            <AppText preset="ctaButton" color={v.text}>
              {children}
            </AppText>
          </>
        )}
      </XStack>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 44,
    borderRadius: radii.button,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fullWidth: {
    width: '100%',
  },
})
