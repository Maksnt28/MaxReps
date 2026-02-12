import { YStack, Text } from 'tamagui'
import { useTranslation } from 'react-i18next'

export default function HomeScreen() {
  const { t } = useTranslation()

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
      <Text color="$color" fontSize={28} fontWeight="700">
        {t('home.title')}
      </Text>
      <Text color="$color" fontSize={16} opacity={0.6} marginTop="$3">
        {t('home.welcome')}
      </Text>
    </YStack>
  )
}
