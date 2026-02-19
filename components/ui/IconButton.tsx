import { YStack } from 'tamagui'
import type { YStackProps } from 'tamagui'
import { colors, spacing } from '@/lib/theme'

interface IconButtonProps extends YStackProps {
  children: React.ReactNode
  badge?: number
}

export function IconButton({ children, badge, ...props }: IconButtonProps) {
  return (
    <YStack
      width={spacing.minTouchTarget}
      height={spacing.minTouchTarget}
      alignItems="center"
      justifyContent="center"
      borderRadius={spacing.minTouchTarget / 2}
      pressStyle={{ backgroundColor: colors.gray3 }}
      cursor="pointer"
      position="relative"
      {...props}
    >
      {children}
      {badge != null && badge > 0 && (
        <YStack
          position="absolute"
          top={4}
          right={4}
          width={16}
          height={16}
          borderRadius={8}
          backgroundColor={colors.accent}
          alignItems="center"
          justifyContent="center"
        />
      )}
    </YStack>
  )
}
