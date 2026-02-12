import { YStack, Text } from 'tamagui'
import { useTranslation } from 'react-i18next'

export default function ProgramsScreen() {
  const { t } = useTranslation()

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
      <Text color="$color" fontSize={20} fontWeight="600">
        {t('tabs.programs')}
      </Text>
    </YStack>
  )
}
