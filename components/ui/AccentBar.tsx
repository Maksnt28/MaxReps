import { YStack } from 'tamagui'
import { accentBar } from '@/lib/theme'

interface AccentBarProps {
  color: string
}

export function AccentBar({ color }: AccentBarProps) {
  return (
    <YStack
      position="absolute"
      top={0}
      left="20%"
      right="20%"
      height={accentBar.height}
      backgroundColor={color as any}
      opacity={accentBar.opacity}
      zIndex={1}
    />
  )
}
