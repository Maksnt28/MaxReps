import { XStack } from 'tamagui'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/AppText'
import { colors, semantic } from '@/lib/theme'

interface MonthSummaryProps {
  sessionCount: number
  totalVolume: number
  prCount: number
  locale: string
}

export function MonthSummary({ sessionCount, totalVolume, prCount, locale }: MonthSummaryProps) {
  const { t } = useTranslation()

  if (sessionCount === 0) return null

  const formattedVolume = new Intl.NumberFormat(locale).format(totalVolume)

  return (
    <XStack paddingHorizontal={16} paddingVertical={8} gap={8} alignItems="center">
      <AppText preset="caption" color={colors.gray8}>
        {t('workout.sessionsCount', { count: sessionCount })}
      </AppText>
      <AppText preset="caption" color={colors.gray6}>
        {'\u00b7'}
      </AppText>
      <AppText preset="caption" color={colors.gray8}>
        {t('workout.volumeKg', { value: formattedVolume })}
      </AppText>
      {prCount > 0 && (
        <>
          <AppText preset="caption" color={colors.gray6}>
            {'\u00b7'}
          </AppText>
          <AppText preset="caption" color={semantic.pr} fontWeight="600">
            {t('workout.prs', { count: prCount })}
          </AppText>
        </>
      )}
    </XStack>
  )
}
