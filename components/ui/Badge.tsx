import { XStack } from 'tamagui'
import type { XStackProps } from 'tamagui'
import { colors, chip, radii } from '@/lib/theme'
import { AppText } from './AppText'

type BadgeVariant = 'active' | 'count' | 'label'

interface BadgeProps extends XStackProps {
  variant?: BadgeVariant
  children: React.ReactNode
}

const variantStyles = {
  active: {
    backgroundColor: colors.accentBg,
    textColor: colors.accent,
  },
  count: {
    backgroundColor: colors.accent,
    textColor: '#FFFFFF',
  },
  label: {
    backgroundColor: chip.dark.background,
    textColor: chip.dark.text,
  },
} as const

export function Badge({ variant = 'label', children, ...props }: BadgeProps) {
  const v = variantStyles[variant]

  return (
    <XStack
      backgroundColor={v.backgroundColor}
      borderRadius={radii.chip}
      paddingHorizontal={6}
      paddingVertical={2}
      alignItems="center"
      {...props}
    >
      <AppText preset="chipLabel" color={v.textColor}>
        {children}
      </AppText>
    </XStack>
  )
}
