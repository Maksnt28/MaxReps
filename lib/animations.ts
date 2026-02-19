import { withSpring, withTiming, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

// ── Spring configs ──────────────────────────────────────
export const springConfigs = {
  /** Snappy press feedback */
  press: { damping: 15, stiffness: 400, mass: 0.5 } satisfies WithSpringConfig,
  /** Checkmark scale-in on set completion */
  scaleIn: { damping: 12, stiffness: 300, mass: 0.8 } satisfies WithSpringConfig,
  /** Filter chip select bounce */
  chip: { damping: 14, stiffness: 350, mass: 0.6 } satisfies WithSpringConfig,
} as const

// ── Timing configs ──────────────────────────────────────
export const timingConfigs = {
  /** Quick opacity fade for press */
  pressOpacity: { duration: 100 } satisfies WithTimingConfig,
  /** Dim completed row */
  dim: { duration: 200 } satisfies WithTimingConfig,
  /** Tab crossfade */
  crossfade: { duration: 200 } satisfies WithTimingConfig,
} as const

// ── Animation factories ─────────────────────────────────
export function pressScale(pressed: boolean) {
  'worklet'
  return withSpring(pressed ? 0.97 : 1, springConfigs.press)
}

export function pressOpacity(pressed: boolean) {
  'worklet'
  return withTiming(pressed ? 0.8 : 1, timingConfigs.pressOpacity)
}

// ── Haptic helpers ──────────────────────────────────────
export function hapticLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

export function hapticMedium() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
}

export function hapticHeavy() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
}

export function hapticNotification(type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) {
  Haptics.notificationAsync(type)
}
