import type { ViewProps } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { separator } from '@/lib/theme'

interface DividerProps extends ViewProps {
  variant?: 'neutral' | 'accent'
  marginVertical?: number
}

export function Divider({ variant = 'neutral', marginVertical, style, ...props }: DividerProps) {
  const color = variant === 'accent' ? separator.accent.dark : separator.neutral.dark

  return (
    <LinearGradient
      colors={['transparent', color, 'transparent']}
      start={{ x: 0.05, y: 0 }}
      end={{ x: 0.95, y: 0 }}
      style={[{ height: 1, marginVertical }, style]}
      {...props}
    />
  )
}
