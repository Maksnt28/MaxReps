import { Pressable } from 'react-native'
import { XStack } from 'tamagui'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/AppText'
import { colors, headerButtonStyles, headerButtonIcon } from '@/lib/theme'

interface MonthNavigatorProps {
  title: string
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
}

export function MonthNavigator({ title, canGoNext, onPrev, onNext }: MonthNavigatorProps) {
  const { t } = useTranslation()

  return (
    <XStack
      paddingHorizontal={16}
      paddingVertical={8}
      alignItems="center"
      justifyContent="space-between"
    >
      <Pressable
        onPress={onPrev}
        style={headerButtonStyles.navButton}
        accessibilityLabel={t('workout.previousMonth')}
      >
        <Ionicons name="chevron-back" size={headerButtonIcon.size} color={headerButtonIcon.color} />
      </Pressable>

      <AppText preset="exerciseName" color={colors.gray12}>
        {title}
      </AppText>

      <Pressable
        onPress={onNext}
        style={[headerButtonStyles.navButton, !canGoNext && { opacity: 0.3 }]}
        disabled={!canGoNext}
        accessibilityLabel={t('workout.nextMonth')}
      >
        <Ionicons name="chevron-forward" size={headerButtonIcon.size} color={headerButtonIcon.color} />
      </Pressable>
    </XStack>
  )
}
