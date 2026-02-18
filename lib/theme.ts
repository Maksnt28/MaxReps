// =============================================================================
// MaxReps — Design Tokens
// =============================================================================
// Central source of truth. Aligned with _design-tokens.yml (authoritative spec).
// Color = information, not decoration. The UI is 95% monochrome.
// Blue = active. Green = progressing. Red = regressing. Gold = record.
// =============================================================================

// ── Accent (Bleu Electrique) ─────────────────────────────
// The only chromatic color in the neutral UI. Means: active, interactive, NOW.
export const accent = {
  accent: '#3B82F6',
  accentBg: 'rgba(59,130,246,0.06)',
  accentBorder: 'rgba(59,130,246,0.10)',
  accentLight: '#2563EB', // light mode variant
} as const

// ── Background Gradient ──────────────────────────────────
// Never flat black. Subtle 3-stop gradient at 168deg.
export const backgroundGradient = {
  dark: ['#08080A', '#0C0C0F', '#0A0A0D'] as const,
  light: ['#F4F4F6', '#F9F9FB', '#FFFFFF'] as const,
  angle: 168,
} as const

// ── Neutral Gray Scale (dark mode, cool-tinted) ──────────
// Anchored to spec values: gray1=bg, gray4=dimmed, gray7=secondary, gray11=primary
export const gray = {
  gray1: '#08080A',   // screen background (gradient fallback)
  gray2: '#0E0E12',   // subtle elevation
  gray3: '#1A1A24',   // elevated surfaces
  gray4: '#2E2E36',   // dimmed: borders, inactive elements
  gray5: '#3C3C46',   // subtle borders
  gray6: '#4C4C56',   // disabled text
  gray7: '#5C5C66',   // secondary text, muted labels, placeholders
  gray8: '#74747E',   // mid-range text
  gray9: '#8E8E98',   // soft text
  gray10: '#ACACB4',  // body text
  gray11: '#E8E8EA',  // primary text
  gray12: '#F4F4F6',  // headings, emphasis (brightest)
} as const

// ── Text (named aliases for clarity in components) ───────
export const text = {
  dark: {
    primary: '#E8E8EA',     // gray11
    secondary: '#5C5C66',   // gray7
    dimmed: '#2E2E36',      // gray4
  },
  light: {
    primary: '#131316',
    secondary: '#76767E',
    dimmed: '#C8C8D0',
  },
} as const

// ── Semantic Colors ──────────────────────────────────────
// Only appear when carrying specific meaning.
export const semantic = {
  progress: '#34E8A0',    // positive deltas (+kg, +reps), momentum positive
  regression: '#FF5A6A',  // negative deltas (-kg, -reps), destructive actions
  pr: '#FFD700',          // personal records only (rarest color in the UI)
} as const

// ── Overload Indicators ──────────────────────────────────
// Weight input left border on pre-filled suggestions.
export const overload = {
  increase: '#34E8A0',    // aligned with progress green
  deload: '#F59E0B',      // coaching suggestion (amber, not regression red)
} as const

// ── Checkmark (neutral completion) ───────────────────────
// Completing a set is not progressing. Never green.
export const checkmark = {
  dark: { bg: '#E8E8EA', fg: '#0A0A0E' },
  light: { bg: '#131316', fg: '#FFFFFF' },
} as const

// ── Card (glass morphism) ────────────────────────────────
// Semi-transparent over background gradient. Used directly in components.
export const card = {
  dark: {
    background: 'rgba(255,255,255,0.035)',
    border: 'rgba(255,255,255,0.06)',
    topEdge: 'rgba(255,255,255,0.04)',
  },
  light: {
    background: 'rgba(255,255,255,0.65)',
    border: 'rgba(0,0,0,0.06)',
    topEdge: 'rgba(0,0,0,0.02)',
  },
  noiseOpacity: 0.018,
  backdropBlur: 16,
  borderRadius: 14,
} as const

// ── Chips & Tags ─────────────────────────────────────────
export const chip = {
  dark: { background: 'rgba(255,255,255,0.05)', text: '#5C5C66' },
  light: { background: 'rgba(0,0,0,0.04)', text: '#76767E' },
  borderRadius: 4,
} as const

// ── Separator ────────────────────────────────────────────
export const separator = {
  neutral: { dark: 'rgba(255,255,255,0.04)', light: 'rgba(0,0,0,0.04)' },
  accent: { dark: 'rgba(59,130,246,0.18)', light: 'rgba(37,99,235,0.12)' },
} as const

// ── Accent Bar (top of active/PR cards) ──────────────────
export const accentBar = {
  height: 2,
  opacity: 0.6,
  horizontalInset: '20%',
} as const

// ── Border Radii ─────────────────────────────────────────
export const radii = {
  chip: 4,
  check: 4,
  progressDot: 1.5,
  activeRow: 8,
  timer: 10,
  button: 12,
  card: 14,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

// ── Spacing ──────────────────────────────────────────────
export const spacing = {
  screenPaddingH: 12,
  screenPaddingV: 14,
  cardGap: 8,
  sectionGap: 10,
  minTouchTarget: 44,
} as const

// ── Shadows ──────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
  },
} as const

// ── Flat color map for Tamagui theme override ────────────
// Only flat key-value pairs. Structured tokens (card, chip, separator, etc.)
// are exported above for direct use in components.
export const colors = {
  ...accent,
  ...gray,
  ...semantic,
  overloadIncrease: overload.increase,
  overloadDeload: overload.deload,
} as const
