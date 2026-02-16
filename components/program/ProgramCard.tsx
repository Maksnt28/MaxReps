import { Pressable } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import type { Program } from '@/hooks/usePrograms'

interface ProgramCardProps {
  program: Program & { program_days: { id: string }[] }
  onPress: () => void
}

export const PROGRAM_CARD_HEIGHT = 72

export function ProgramCard({ program, onPress }: ProgramCardProps) {
  const { t } = useTranslation()
  const dayCount = program.program_days.length

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={program.name}
      accessibilityRole="button"
    >
      <XStack
        height={PROGRAM_CARD_HEIGHT}
        alignItems="center"
        paddingHorizontal="$3"
        gap="$3"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <YStack
          width={44}
          height={44}
          borderRadius="$3"
          backgroundColor="$backgroundHover"
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name="clipboard-outline" size={22} color="#888" />
        </YStack>
        <YStack flex={1} gap="$1">
          <Text color="$color" fontSize={16} fontWeight="500" numberOfLines={1}>
            {program.name}
          </Text>
          <XStack gap="$2" alignItems="center">
            <Text color="$gray10" fontSize={12}>
              {t('programs.dayCount', { count: dayCount })}
            </Text>
            {program.is_active && (
              <>
                <Text color="$gray10" fontSize={10}>{'·'}</Text>
                <Text color="$green10" fontSize={12} fontWeight="500">
                  {t('programs.active')}
                </Text>
              </>
            )}
          </XStack>
        </YStack>
        <Ionicons name="chevron-forward" size={18} color="#555" />
      </XStack>
    </Pressable>
  )
}
