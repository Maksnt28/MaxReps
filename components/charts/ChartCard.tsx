import { Pressable } from 'react-native'
import { YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/AppText'
import { AppCard } from '@/components/ui/AppCard'
import { colors } from '@/lib/theme'

interface ChartCardProps {
  title: string
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  children: React.ReactNode
}

export function ChartCard({ title, isLoading, isError, onRetry, children }: ChartCardProps) {
  const { t } = useTranslation()

  return (
    <AppCard>
      <AppText preset="body" style={{ color: colors.gray11, fontFamily: 'Inter-SemiBold', marginBottom: 8 }}>
        {title}
      </AppText>

      {isError ? (
        <Pressable onPress={onRetry}>
          <YStack alignItems="center" paddingVertical={24}>
            <AppText preset="caption" style={{ color: colors.gray7, textAlign: 'center' }}>
              {t('progress.retry')}
            </AppText>
          </YStack>
        </Pressable>
      ) : isLoading ? (
        <YStack height={180} justifyContent="center" alignItems="center">
          <AppText preset="caption" style={{ color: colors.gray6 }}>
            {t('common.loading')}
          </AppText>
        </YStack>
      ) : (
        children
      )}
    </AppCard>
  )
}
