import { YStack, Text, Button } from 'tamagui'

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
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$3">
      <Text color="$color" fontSize={18} fontWeight="600" textAlign="center">
        {title}
      </Text>
      <Text color="$gray10" fontSize={14} textAlign="center">
        {message}
      </Text>
      {onAction && actionLabel && (
        <Button
          marginTop="$2"
          size="$4"
          onPress={onAction}
          accessibilityLabel={actionLabel}
        >
          {actionLabel}
        </Button>
      )}
    </YStack>
  )
}
