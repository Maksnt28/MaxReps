import { Text, styled } from 'tamagui'
import type { GetProps } from 'tamagui'
import { colors } from '@/lib/theme'

// Typography presets matching plan's 4-tier hierarchy.
// All numeric values use tabular-nums to prevent layout shift.
const presets = {
  // Tier 1 — Primary data
  pageTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    lineHeight: 26,
    color: colors.gray12,
  },
  setWeight: {
    fontSize: 16,
    fontWeight: '700' as const,
    fontVariantNumeric: 'tabular-nums',
  },
  timerCountdown: {
    fontSize: 18,
    fontWeight: '700' as const,
    fontVariantNumeric: 'tabular-nums',
  },
  ctaButton: {
    fontSize: 16,
    fontWeight: '700' as const,
  },

  // Tier 2 — Secondary
  exerciseName: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '700' as const,
    fontVariantNumeric: 'tabular-nums',
  },
  setReps: {
    fontSize: 14,
    fontWeight: '600' as const,
    fontVariantNumeric: 'tabular-nums',
  },

  // Tier 3 — Tertiary
  lastSession: {
    fontSize: 12,
    fontWeight: '600' as const,
    fontVariantNumeric: 'tabular-nums',
  },
  delta: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  ghostValue: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.gray4,
  },

  // Tier 4 — Labels & chips
  columnHeader: {
    fontSize: 10,
    fontWeight: '400' as const,
    textTransform: 'uppercase' as const,
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  },

  // General presets
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
} as const

export type TextPreset = keyof typeof presets

const StyledText = styled(Text, {
  color: '$color',
  fontFamily: '$body',
})

type StyledTextProps = GetProps<typeof StyledText>

interface AppTextProps extends Omit<StyledTextProps, 'preset'> {
  preset?: TextPreset
  children: React.ReactNode
}

export function AppText({ preset, style, ...props }: AppTextProps) {
  const presetStyles = preset ? presets[preset] : undefined

  return (
    <StyledText
      {...presetStyles}
      {...props}
      style={style}
    />
  )
}
