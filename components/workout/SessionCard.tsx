import { XStack, YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/AppText'
import { AppCard } from '@/components/ui/AppCard'
import { colors, semantic } from '@/lib/theme'
import { formatDuration } from '@/lib/timerUtils'
import type { SessionSummary } from '@/hooks/useWorkoutSessions'

interface SessionCardProps {
  session: SessionSummary
  exerciseNames: string[]
  onPress: () => void
}

export function SessionCard({ session, exerciseNames, onPress }: SessionCardProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const date = new Date(session.startedAt)
  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)

  const formattedVolume = new Intl.NumberFormat(locale).format(session.totalVolume)

  return (
    <AppCard
      variant="interactive"
      onPress={onPress}
      accessibilityLabel={t('workout.sessionAccessibility', { date: formattedDate })}
    >
      <YStack gap={6}>
        {/* Date + Duration */}
        <XStack justifyContent="space-between" alignItems="center">
          <AppText preset="exerciseName" color={colors.gray11}>
            {formattedDate}
          </AppText>
          {session.durationSeconds != null && (
            <AppText preset="caption" color={colors.gray7}>
              {formatDuration(session.durationSeconds)}
            </AppText>
          )}
        </XStack>

        {/* Exercise names */}
        {exerciseNames.length > 0 && (
          <AppText preset="caption" color={colors.gray7} numberOfLines={2}>
            {exerciseNames.join(', ')}
          </AppText>
        )}

        {/* Stats row */}
        <XStack gap={12} alignItems="center">
          <AppText preset="caption" color={colors.gray8}>
            {t('workout.setsCount', { count: session.setCount })}
          </AppText>
          <AppText preset="caption" color={colors.gray8}>
            {t('workout.volumeKg', { value: formattedVolume })}
          </AppText>
          {session.prCount > 0 && (
            <AppText preset="caption" color={semantic.pr} fontWeight="600">
              {t('workout.prs', { count: session.prCount })}
            </AppText>
          )}
        </XStack>
      </YStack>
    </AppCard>
  )
}
