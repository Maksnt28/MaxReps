import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { AppText } from '@/components/ui/AppText'
import { colors } from '@/lib/theme'

export default function HomeScreen() {
  const { t } = useTranslation()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
      <YStack flex={1} backgroundColor={colors.gray1}>
        <YStack paddingHorizontal={16} paddingTop={16} paddingBottom={8}>
          <AppText fontSize={28} fontWeight="800" color={colors.gray12}>
            {t('tabs.home')}
          </AppText>
        </YStack>
        <YStack flex={1} alignItems="center" justifyContent="center" paddingHorizontal={32}>
          <AppText
            fontSize={32}
            fontWeight="800"
            lineHeight={40}
            color={colors.accent}
            textAlign="center"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {t('home.title')}
          </AppText>
          <AppText preset="body" color={colors.gray8} marginTop={12}>
            {t('home.welcome')}
          </AppText>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
