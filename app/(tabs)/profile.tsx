import { useState } from 'react'
import { Alert } from 'react-native'
import { YStack, Text, Button, Spinner } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { signOut } from '@/lib/auth'
import { useUserStore } from '@/stores/useUserStore'

export default function ProfileScreen() {
  const { t } = useTranslation()
  const displayName = useUserStore((s) => s.displayName)
  const [loading, setLoading] = useState(false)

  function handleSignOut() {
    Alert.alert(t('auth.signOut'), t('auth.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.signOut'),
        style: 'destructive',
        onPress: async () => {
          setLoading(true)
          await signOut()
          setLoading(false)
        },
      },
    ])
  }

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background" gap="$4" paddingHorizontal="$6">
      <Text color="$color" fontSize={20} fontWeight="600">
        {displayName ?? t('tabs.profile')}
      </Text>

      <Button
        size="$4"
        width="100%"
        theme="red"
        disabled={loading}
        onPress={handleSignOut}
        accessibilityLabel={t('auth.signOut')}
        icon={loading ? <Spinner /> : undefined}
      >
        {t('auth.signOut')}
      </Button>
    </YStack>
  )
}
