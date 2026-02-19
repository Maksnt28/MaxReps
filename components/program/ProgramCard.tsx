import { XStack, YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import type { Program } from '@/hooks/usePrograms'
import { AppCard } from '@/components/ui/AppCard'
import { AppText } from '@/components/ui/AppText'
import { Badge } from '@/components/ui/Badge'
import { colors } from '@/lib/theme'

interface ProgramCardProps {
  program: Program & { program_days: { id: string }[] }
  onPress: () => void
}

export const PROGRAM_CARD_HEIGHT = 72

export function ProgramCard({ program, onPress }: ProgramCardProps) {
  const { t } = useTranslation()
  const dayCount = program.program_days.length

  return (
    <AppCard
      variant="interactive"
      onPress={onPress}
      accessibilityLabel={program.name}
      accessibilityRole="button"
    >
      <XStack alignItems="center" gap={12}>
        <YStack
          width={44}
          height={44}
          borderRadius={12}
          backgroundColor={colors.gray3}
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name="clipboard-outline" size={22} color={colors.gray7} />
        </YStack>
        <YStack flex={1} gap={4}>
          <AppText preset="exerciseName" numberOfLines={1}>
            {program.name}
          </AppText>
          <XStack gap={8} alignItems="center">
            <AppText preset="caption" color={colors.gray8}>
              {t('programs.dayCount', { count: dayCount })}
            </AppText>
            {program.is_active && (
              <Badge variant="active">{t('programs.active')}</Badge>
            )}
          </XStack>
        </YStack>
        <Ionicons name="chevron-forward" size={18} color={colors.gray6} />
      </XStack>
    </AppCard>
  )
}
