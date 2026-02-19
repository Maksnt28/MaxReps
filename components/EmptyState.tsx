import { YStack } from 'tamagui'

import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { colors } from '@/lib/theme'

interface EmptyStateProps {
  title: string
  message: string
  onAction?: () => void
  actionLabel?: string
}

export function EmptyState({
  title,
  message,
  onAction,
  actionLabel,
}: EmptyStateProps) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding={24} gap={12}>
      <AppText preset="pageTitle" textAlign="center">
        {title}
      </AppText>
      <AppText preset="body" color={colors.gray8} textAlign="center">
        {message}
      </AppText>
      {onAction && actionLabel && (
        <AppButton
          variant="primary"
          onPress={onAction}
          accessibilityLabel={actionLabel}
        >
          {actionLabel}
        </AppButton>
      )}
    </YStack>
  )
}
