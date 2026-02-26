import { View, StyleSheet } from 'react-native'
import { YStack, XStack } from 'tamagui'
import { useTranslation } from 'react-i18next'

import { useWeeklyProgress } from '@/hooks/useWeeklyProgress'
import { WEEK_DAY_ORDER } from '@/lib/weeklyProgress'
import { AppCard } from '@/components/ui/AppCard'
import { AppText } from '@/components/ui/AppText'
import { colors, semantic } from '@/lib/theme'

const DOT_SIZE = 8

export function WeeklyProgressCard() {
  const { data, isLoading } = useWeeklyProgress()
  const { t, i18n } = useTranslation()

  if (isLoading) return null
  if (!data) return null

  const { daysCompleted, daysTarget, workoutDayNumbers } = data

  // Hidden when no target and no sessions
  if (daysTarget == null && daysCompleted === 0) return null

  const today = new Date().getDay()
  const isGoalMet = daysTarget != null && daysCompleted >= daysTarget

  // Progress bar ratio
  const progress = daysTarget != null && daysTarget > 0
    ? Math.min(1, daysCompleted / daysTarget)
    : 0

  // Right-side label
  const countLabel = daysTarget != null
    ? t('home.daysProgress', { completed: daysCompleted, target: daysTarget })
    : t('home.daysCount', { count: daysCompleted })

  // Locale-aware short weekday labels (Mon-Sun)
  const weekdayLabels = WEEK_DAY_ORDER.map((dayIdx) => {
    const refDate = new Date(2026, 0, 4 + dayIdx) // 2026-01-04 is Sunday (dayIdx=0), Jan 5 is Monday (dayIdx=1)
    return new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(refDate)
  })

  return (
    <AppCard>
      <YStack gap={10}>
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <AppText preset="caption" color={colors.gray7}>
            {t('home.thisWeek')}
          </AppText>
          <AppText
            preset="caption"
            color={isGoalMet ? semantic.progress : colors.gray7}
            fontWeight={isGoalMet ? '600' : undefined}
          >
            {countLabel}
          </AppText>
        </XStack>

        {/* Progress bar (only when target exists) */}
        {daysTarget != null && (
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${progress * 100}%` },
              ]}
            />
          </View>
        )}

        {/* Day dots */}
        <XStack justifyContent="space-between" alignItems="center">
          {WEEK_DAY_ORDER.map((dayIdx, i) => {
            const hasWorkout = workoutDayNumbers.has(dayIdx)
            const isToday = dayIdx === today

            return (
              <YStack key={dayIdx} alignItems="center" gap={4}>
                <AppText
                  preset="caption"
                  color={colors.gray7}
                  fontSize={11}
                >
                  {weekdayLabels[i]}
                </AppText>
                <View
                  style={[
                    styles.dot,
                    hasWorkout && styles.dotFilled,
                    !hasWorkout && isToday && styles.dotToday,
                  ]}
                  accessibilityLabel={
                    `${weekdayLabels[i]}: ${hasWorkout ? t('home.thisWeek') : ''}`
                  }
                />
              </YStack>
            )
          })}
        </XStack>
      </YStack>
    </AppCard>
  )
}

const styles = StyleSheet.create({
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.gray5,
  },
  dotFilled: {
    backgroundColor: colors.accent,
  },
  dotToday: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
})
