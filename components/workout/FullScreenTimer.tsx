import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { XStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRestTimerStore } from '@/stores/useRestTimerStore'
import { useExercises } from '@/hooks/useExercises'
import { getLocalizedExercise } from '@/lib/exercises'
import { ProgressRing } from './ProgressRing'
import { AppText } from '@/components/ui/AppText'
import { hapticNotification } from '@/lib/animations'
import { colors, radii, chip } from '@/lib/theme'
import { formatTime, computeRemaining } from '@/lib/timerUtils'

interface FullScreenTimerProps {
  onCollapse: () => void
}

// Tab bar content height (CustomTabBar: paddingTop 8 + tab ~48)
const TAB_BAR_CONTENT_HEIGHT = 60

export function FullScreenTimer({ onCollapse }: FullScreenTimerProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const insets = useSafeAreaInsets()

  const expiresAt = useRestTimerStore((s) => s.expiresAt)
  const durationSeconds = useRestTimerStore((s) => s.durationSeconds)
  const exerciseId = useRestTimerStore((s) => s.exerciseId)
  const addTime = useRestTimerStore((s) => s.addTime)
  const skip = useRestTimerStore((s) => s.skip)
  const expire = useRestTimerStore((s) => s.expire)
  const isAdaptiveFailure = useRestTimerStore((s) => s.isAdaptiveFailure)

  const { data: allExercises } = useExercises()

  const exerciseName = (() => {
    if (!exerciseId) return ''
    const exercise = allExercises?.find((e) => e.id === exerciseId)
    return exercise ? getLocalizedExercise(exercise, locale).name : exerciseId
  })()

  const [remaining, setRemaining] = useState(() => computeRemaining(expiresAt))
  const hasExpiredRef = useRef(false)

  useEffect(() => {
    hasExpiredRef.current = false
  }, [])

  useEffect(() => {
    setRemaining(computeRemaining(expiresAt))

    const interval = setInterval(() => {
      if (expiresAt === null) return
      const r = computeRemaining(expiresAt)
      setRemaining(r)

      if (r <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true
        hapticNotification()
        expire()
        // NO onCollapse() here — parent's useEffect handles collapse
      }
    }, 500)

    return () => clearInterval(interval)
  }, [expiresAt, expire])

  const handleSubtract = useCallback(() => {
    addTime(-15)
    const state = useRestTimerStore.getState()
    if (!state.isRunning) {
      hapticNotification() // subtract-to-zero: fire haptic from UI, not store
    }
    setRemaining(computeRemaining(state.expiresAt))
  }, [addTime])

  const handleAdd = useCallback(() => {
    addTime(15)
    setRemaining(computeRemaining(useRestTimerStore.getState().expiresAt))
  }, [addTime])

  const progress = durationSeconds > 0 ? Math.min(1, remaining / durationSeconds) : 0

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={styles.overlay}
      pointerEvents="auto"
      accessibilityRole="timer"
      accessibilityLiveRegion="polite"
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal={20}
          paddingVertical={12}
        >
          <AppText fontSize={14} color={colors.gray7} numberOfLines={1} flex={1}>
            {exerciseName}
          </AppText>
          <Pressable
            onPress={onCollapse}
            accessibilityLabel={t('workout.collapse')}
            hitSlop={12}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.gray7} />
          </Pressable>
        </XStack>

        {/* Center */}
        <View style={styles.center}>
          <ProgressRing size={160} strokeWidth={4} progress={progress} />
          <AppText
            fontSize={72}
            fontWeight="700"
            color={colors.gray12}
            fontVariant={['tabular-nums']}
            style={styles.countdown}
          >
            {formatTime(remaining)}
          </AppText>
          <AppText
            fontSize={14}
            fontWeight="600"
            color={isAdaptiveFailure ? colors.accent : colors.gray7}
            letterSpacing={1}
            textTransform="uppercase"
            marginTop={4}
          >
            {isAdaptiveFailure ? t('workout.extendedRest') : t('workout.rest')}
          </AppText>
        </View>

        {/* Bottom controls */}
        <View style={[styles.bottom, { paddingBottom: TAB_BAR_CONTENT_HEIGHT + insets.bottom }]}>
          <TouchableOpacity
            style={[styles.button, remaining <= 15 && styles.buttonDisabled]}
            onPress={handleSubtract}
            disabled={remaining <= 15}
            accessibilityLabel={t('workout.subtractTime')}
          >
            <AppText fontSize={16} fontWeight="600" color={colors.accent}>
              {t('workout.subtractTime')}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleAdd}
            accessibilityLabel={t('workout.addTime')}
          >
            <AppText fontSize={16} fontWeight="600" color={colors.accent}>
              {t('workout.addTime')}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={skip}
            accessibilityLabel={t('workout.skip')}
          >
            <AppText fontSize={16} fontWeight="600" color={colors.gray7}>
              {t('workout.skip')}
            </AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: colors.gray1,
  },
  safeArea: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdown: {
    marginTop: 16,
    lineHeight: 80,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: 'rgba(59,130,246,0.18)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radii.chip,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: chip.dark.background,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radii.chip,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
})
