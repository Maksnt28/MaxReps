import { defaultConfig } from '@tamagui/config/v5'
import { animations } from '@tamagui/config/v5-rn'
import { createFont, createTamagui } from 'tamagui'
import { colors } from '@/lib/theme'

// Inter font — 5 weights, registered via expo-font in _layout.tsx
// Size scale maps to plan's typography tiers (10–20px)
const interFont = createFont({
  family: 'Inter',
  size: {
    1: 10,
    2: 11,
    3: 12,
    4: 13,
    5: 14,
    6: 15,
    7: 16,
    8: 18,
    9: 20,
    true: 16,
  },
  lineHeight: {
    1: 14,
    2: 16,
    3: 17,
    4: 18,
    5: 19,
    6: 20,
    7: 22,
    8: 24,
    9: 26,
    true: 22,
  },
  weight: {
    4: '400',
    5: '500',
    6: '600',
    7: '700',
    8: '800',
  },
  letterSpacing: {
    1: 0.4,
    true: 0,
  },
  face: {
    400: { normal: 'Inter-Regular' },
    500: { normal: 'Inter-Medium' },
    600: { normal: 'Inter-SemiBold' },
    700: { normal: 'Inter-Bold' },
    800: { normal: 'Inter-ExtraBold' },
  },
})

// Override the dark theme to align with _design-tokens.yml spec.
// Monochrome-first: blue accent for active/interactive, neutral grays for everything else.
// Card backgrounds use rgba transparency (applied directly in components, not here).
const darkThemeOverrides = {
  // Core backgrounds → custom gray scale
  background: colors.gray1,
  backgroundHover: colors.gray2,
  backgroundPress: colors.gray1,
  backgroundFocus: colors.gray2,
  backgroundActive: colors.gray3,

  // Text → gray11 as primary (spec: #E8E8EA), gray12 for emphasis
  color: colors.gray11,
  colorHover: colors.gray10,
  colorPress: colors.gray9,
  colorFocus: colors.gray11,

  // Borders → gray4 (spec dimmed: #2E2E36)
  borderColor: colors.gray4,
  borderColorHover: colors.gray5,
  borderColorFocus: colors.accent,
  borderColorPress: colors.gray4,

  placeholderColor: colors.gray7,

  // Accent → Bleu Electrique (#3B82F6)
  accentBackground: colors.accent,
  accentColor: colors.gray12,

  // Shadow
  shadowColor: 'rgba(0,0,0,0.5)',

  // Override the gray palette to match our custom scale
  gray1: colors.gray1,
  gray2: colors.gray2,
  gray3: colors.gray3,
  gray4: colors.gray4,
  gray5: colors.gray5,
  gray6: colors.gray6,
  gray7: colors.gray7,
  gray8: colors.gray8,
  gray9: colors.gray9,
  gray10: colors.gray10,
  gray11: colors.gray11,
  gray12: colors.gray12,
} as const

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  animations,
  fonts: {
    ...defaultConfig.fonts,
    heading: interFont,
    body: interFont,
  },
  themes: {
    ...defaultConfig.themes,
    dark: {
      ...defaultConfig.themes.dark,
      ...darkThemeOverrides,
    },
  },
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
  },
})

export default tamaguiConfig

export type AppConfig = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
