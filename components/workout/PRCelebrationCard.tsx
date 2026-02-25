import { useEffect, useRef, useState } from 'react'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated'
import Ionicons from '@expo/vector-icons/Ionicons'

import { hapticNotification } from '@/lib/animations'
import { AppText } from '@/components/ui/AppText'
import { colors, radii } from '@/lib/theme'

interface PRCelebrationCardProps {
  exerciseName: string
  newMax: number
  previousMax: number
  delta: number
}

const AUTO_DISMISS_MS = 5000

export function PRCelebrationCard({
  exerciseName,
  newMax,
  previousMax,
  delta,
}: PRCelebrationCardProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Haptic on mount + auto-dismiss timer
  useEffect(() => {
    hapticNotification()
    resetTimer()
    return () => clearTimeout(timerRef.current)
  }, [])

  // Reset auto-dismiss timer when PR values change (re-PR on same exercise)
  useEffect(() => {
    setVisible(true)
    resetTimer()
  }, [newMax])

  function resetTimer() {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), AUTO_DISMISS_MS)
  }

  function handleDismiss() {
    clearTimeout(timerRef.current)
    setVisible(false)
  }

  if (!visible) return null

  const isFirstRecord = previousMax === 0

  return (
    <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut.duration(200)}>
      <Pressable onPress={handleDismiss} accessibilityLabel={t('workout.prAchieved')}>
        <YStack
          backgroundColor="rgba(255,215,0,0.08)"
          borderRadius={radii.card}
          borderWidth={1}
          borderColor="rgba(255,215,0,0.15)"
          padding={12}
          marginTop={8}
          gap={4}
        >
          {/* Gold accent bar */}
          <YStack
            height={2}
            backgroundColor={colors.pr}
            opacity={0.6}
            borderRadius={1}
            alignSelf="center"
            width="60%"
            marginBottom={4}
          />

          {/* Exercise name + trophy */}
          <XStack alignItems="center" gap={6}>
            <Ionicons name="trophy" size={16} color={colors.pr} />
            <AppText fontSize={11} fontWeight="700" color={colors.pr} textTransform="uppercase" letterSpacing={1}>
              {exerciseName}
            </AppText>
          </XStack>

          {/* Record weight */}
          <AppText fontSize={24} fontWeight="800" color={colors.gray12}>
            {newMax} kg
          </AppText>

          {/* Delta or first record label */}
          {isFirstRecord ? (
            <AppText fontSize={12} fontWeight="600" color={colors.pr}>
              {t('workout.prFirst')}
            </AppText>
          ) : (
            <AppText fontSize={12} fontWeight="600" color={colors.progress}>
              {t('workout.prDelta', { delta })}
            </AppText>
          )}
        </YStack>
      </Pressable>
    </Animated.View>
  )
}
