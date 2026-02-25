import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useRestTimerStore } from '@/stores/useRestTimerStore'
import { ProgressRing } from './ProgressRing'
import { AccentBar } from '@/components/ui/AccentBar'
import { AppText } from '@/components/ui/AppText'
import { hapticNotification } from '@/lib/animations'
import { accent, colors, radii, chip, spacing } from '@/lib/theme'
import { formatTime, computeRemaining } from '@/lib/timerUtils'

interface RestTimerBandeauProps {
  onExpand?: () => void
}

export function RestTimerBandeau({ onExpand }: RestTimerBandeauProps) {
  const { t } = useTranslation()
  const expiresAt = useRestTimerStore((s) => s.expiresAt)
  const durationSeconds = useRestTimerStore((s) => s.durationSeconds)
  const addTime = useRestTimerStore((s) => s.addTime)
  const skip = useRestTimerStore((s) => s.skip)
  const expire = useRestTimerStore((s) => s.expire)
  const isAdaptiveFailure = useRestTimerStore((s) => s.isAdaptiveFailure)

  const [remaining, setRemaining] = useState(() => computeRemaining(expiresAt))
  const hasExpiredRef = useRef(false)

  useEffect(() => {
    hasExpiredRef.current = false
  }, [])

  useEffect(() => {
    // Sync immediately when expiresAt changes (e.g. after +15s)
    setRemaining(computeRemaining(expiresAt))

    const interval = setInterval(() => {
      if (expiresAt === null) return
      const r = computeRemaining(expiresAt)
      setRemaining(r)

      if (r <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true
        hapticNotification()
        expire()
      }
    }, 500)

    return () => clearInterval(interval)
  }, [expiresAt, expire])

  const handleSubtract = useCallback(() => {
    addTime(-15)
    const state = useRestTimerStore.getState()
    if (!state.isRunning) {
      // addTime triggered early expire — fire haptic here since the
      // bandeau's interval won't detect it (store stays pure, no native imports)
      hapticNotification()
    }
    setRemaining(computeRemaining(state.expiresAt))
  }, [addTime])

  const handleAdd = useCallback(() => {
    addTime(15)
    setRemaining(computeRemaining(useRestTimerStore.getState().expiresAt))
  }, [addTime])

  const progress = durationSeconds > 0 ? Math.min(1, remaining / durationSeconds) : 0

  const content = (
    <View style={styles.container}>
      <AccentBar color={colors.accent} />

      <View style={styles.content}>
        <View style={styles.left}>
          <ProgressRing size={22} strokeWidth={2} progress={progress} />
          <AppText fontSize={16} fontWeight="700" color={colors.gray12} fontVariant={['tabular-nums']}>
            {formatTime(remaining)}
          </AppText>
          <AppText
            fontSize={10}
            fontWeight="600"
            color={isAdaptiveFailure ? colors.accent : colors.gray7}
            letterSpacing={0.8}
            textTransform="uppercase"
          >
            {isAdaptiveFailure ? t('workout.extendedRest') : t('workout.rest')}
          </AppText>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.addButton, remaining <= 15 && styles.buttonDisabled]}
            onPress={handleSubtract}
            disabled={remaining <= 15}
            accessibilityLabel={t('workout.subtractTime')}
            hitSlop={6}
          >
            <AppText fontSize={12} fontWeight="600" color={colors.accent}>
              {t('workout.subtractTime')}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}
            accessibilityLabel={t('workout.addTime')}
            hitSlop={6}
          >
            <AppText fontSize={12} fontWeight="600" color={colors.accent}>
              {t('workout.addTime')}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={skip}
            accessibilityLabel={t('workout.skip')}
            hitSlop={6}
          >
            <AppText fontSize={12} fontWeight="600" color={colors.gray7}>
              {t('workout.skip')}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutUp.duration(150)}
      style={styles.wrapper}
      accessibilityRole="timer"
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('workout.restTimer')}
    >
      {onExpand ? (
        <Pressable onPress={onExpand}>{content}</Pressable>
      ) : (
        content
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.screenPaddingH,
    marginVertical: 6,
  },
  container: {
    backgroundColor: accent.accentBg,
    borderWidth: 1,
    borderColor: accent.accentBorder,
    borderRadius: radii.timer,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    backgroundColor: 'rgba(59,130,246,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.chip,
  },
  skipButton: {
    backgroundColor: chip.dark.background,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.chip,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
})
