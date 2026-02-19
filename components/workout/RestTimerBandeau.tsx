import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useRestTimerStore } from '@/stores/useRestTimerStore'
import { ProgressRing } from './ProgressRing'
import { AccentBar } from '@/components/ui/AccentBar'
import { AppText } from '@/components/ui/AppText'
import { hapticNotification } from '@/lib/animations'
import { accent, colors, radii, chip, spacing } from '@/lib/theme'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function computeRemaining(expiresAt: number | null): number {
  if (expiresAt === null) return 0
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
}

export function RestTimerBandeau() {
  const { t } = useTranslation()
  const expiresAt = useRestTimerStore((s) => s.expiresAt)
  const durationSeconds = useRestTimerStore((s) => s.durationSeconds)
  const addTime = useRestTimerStore((s) => s.addTime)
  const skip = useRestTimerStore((s) => s.skip)
  const expire = useRestTimerStore((s) => s.expire)

  const [remaining, setRemaining] = useState(() => computeRemaining(expiresAt))
  const hasExpiredRef = useRef(false)

  useEffect(() => {
    hasExpiredRef.current = false
  }, [])

  useEffect(() => {
    // Sync immediately when expiresAt changes (e.g. after +30s)
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

  const handleAddTime = useCallback(() => {
    addTime(30)
    // Immediately reflect the new expiresAt — don't wait for next tick
    const newExpiresAt = useRestTimerStore.getState().expiresAt
    setRemaining(computeRemaining(newExpiresAt))
  }, [addTime])

  const progress = durationSeconds > 0 ? remaining / durationSeconds : 0

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutUp.duration(150)}
      style={styles.wrapper}
      accessibilityRole="timer"
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('workout.restTimer')}
    >
      <View style={styles.container}>
        <AccentBar color={colors.accent} />

        <View style={styles.content}>
          <View style={styles.left}>
            <ProgressRing size={22} strokeWidth={2} progress={progress} />
            <AppText fontSize={16} fontWeight="700" color={colors.gray12} fontVariant={['tabular-nums']}>
              {formatTime(remaining)}
            </AppText>
            <AppText fontSize={11} color={colors.gray7}>
              {t('workout.rest')}
            </AppText>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddTime}
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
})
