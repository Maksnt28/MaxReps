import { YStack, XStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useWorkoutStreak } from '@/hooks/useWorkoutStreak'
import { getMilestoneKey } from '@/lib/streakCalculation'
import { AppCard } from '@/components/ui/AppCard'
import { AppText } from '@/components/ui/AppText'
import { colors, semantic } from '@/lib/theme'

export function StreakCard() {
  const { data, isLoading } = useWorkoutStreak()
  const { t } = useTranslation()

  if (isLoading) return null
  if (!data) return null

  const { currentStreak, longestStreak } = data

  // Hidden when brand new user
  if (currentStreak === 0 && longestStreak === 0) return null

  const isPersonalBest = currentStreak > 0 && currentStreak >= longestStreak
  const milestoneKey = getMilestoneKey(currentStreak)

  return (
    <AppCard>
      <YStack gap={4}>
        <XStack justifyContent="space-between" alignItems="flex-start">
          {/* Current streak */}
          <YStack>
            <XStack alignItems="center" gap={6}>
              <Ionicons name="flame-outline" size={16} color={colors.accent} />
              <AppText
                fontSize={28}
                fontWeight="700"
                color={colors.gray12}
                fontVariant={['tabular-nums']}
              >
                {currentStreak}
              </AppText>
              <AppText preset="caption" color={colors.gray7}>
                {t('home.weeks')}
              </AppText>
            </XStack>
            <AppText preset="caption" color={colors.gray7}>
              {t('home.currentStreak')}
            </AppText>
          </YStack>

          {/* Longest streak or personal best badge */}
          <YStack alignItems="flex-end">
            {isPersonalBest ? (
              <AppText preset="caption" color={semantic.pr} fontWeight="600">
                {t('home.personalBest')}
              </AppText>
            ) : (
              <>
                <AppText preset="caption" color={colors.gray7}>
                  {t('home.longestStreak')}
                </AppText>
                <AppText preset="caption" color={colors.gray7} fontWeight="600">
                  {longestStreak}
                </AppText>
              </>
            )}
          </YStack>
        </XStack>

        {/* Milestone text */}
        {milestoneKey && (
          <AppText preset="caption" color={colors.accent}>
            {t(milestoneKey)}
          </AppText>
        )}
      </YStack>
    </AppCard>
  )
}
