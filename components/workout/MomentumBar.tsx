import { useMemo } from 'react'
import { XStack, YStack } from 'tamagui'
import { useQueryClient } from '@tanstack/react-query'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'

import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { calculateMomentum } from '@/lib/momentum'
import { AppText } from '@/components/ui/AppText'
import { colors, spacing } from '@/lib/theme'
import type { SessionHistory } from '@/lib/overload'

interface MomentumBarProps {
  exerciseIds: string[]
}

const BAR_HEIGHT = 3.5

export function MomentumBar({ exerciseIds }: MomentumBarProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const exercises = useWorkoutStore((s) => s.exercises)

  // Read last-session data from React Query cache (populated by ExerciseCard's useExerciseHistory)
  const lastSessionMap = useMemo(() => {
    const map = new Map<string, SessionHistory[]>()
    for (const id of exerciseIds) {
      const cached = queryClient.getQueryData<SessionHistory[]>(['exercise-history', id])
      if (cached) map.set(id, cached)
    }
    return map
  }, [exerciseIds, exercises, queryClient])

  const momentum = useMemo(
    () => calculateMomentum(exercises, lastSessionMap),
    [exercises, lastSessionMap]
  )

  // Check if at least 1 working set is completed
  const hasCompletedSet = exercises.some((e) =>
    e.sets.some((s) => !s.isWarmup && s.isCompleted)
  )

  if (!momentum || !hasCompletedSet) return null

  const isPositive = momentum.direction === 'up'
  const isNegative = momentum.direction === 'down'
  const barColor = isPositive ? colors.progress : isNegative ? colors.regression : colors.gray6
  // Clamp percentage to [0, 100] for bar width calculation (bar goes 0-50% of width from center)
  const absPct = Math.min(Math.abs(momentum.percentage), 100)

  return (
    <XStack
      alignItems="center"
      gap={8}
      paddingHorizontal={spacing.screenPaddingH}
      paddingVertical={4}
    >
      <AppText fontSize={9} fontWeight="700" color={colors.gray6} letterSpacing={1}>
        {t('workout.momentum')}
      </AppText>

      {/* Bar container */}
      <XStack flex={1} height={BAR_HEIGHT} backgroundColor={colors.gray3} borderRadius={2} overflow="hidden">
        {/* Center line */}
        <YStack position="absolute" left="50%" width={1} height="100%" backgroundColor={colors.gray5} />

        {/* Fill bar */}
        <AnimatedFill
          percentage={absPct}
          isPositive={isPositive || momentum.direction === 'even'}
          color={barColor}
        />
      </XStack>

      <AppText fontSize={11} fontWeight="700" color={barColor}>
        {isPositive ? '+' : isNegative ? '' : ''}{momentum.percentage}%
      </AppText>
    </XStack>
  )
}

function AnimatedFill({
  percentage,
  isPositive,
  color,
}: {
  percentage: number
  isPositive: boolean
  color: string
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const width = withTiming(percentage / 2, { duration: 300 })
    return {
      width: `${width}%` as any,
      // Positive fills right from center, negative fills left from center
      left: isPositive ? '50%' : undefined,
      right: isPositive ? undefined : '50%',
    }
  }, [percentage, isPositive])

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          bottom: 0,
          backgroundColor: color,
          borderRadius: 2,
        },
        animatedStyle,
      ]}
    />
  )
}
