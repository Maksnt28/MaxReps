import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { YStack, Text, Button, Spinner } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/useUserStore'

export default function ProfileScreen() {
  const { t } = useTranslation()
  const { displayName, setUser } = useUserStore()
  const [loading, setLoading] = useState(false)

  // Fallback: fetch profile if store is empty (e.g. syncUserProfile race condition)
  useEffect(() => {
    if (displayName) return

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return

      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (data) {
          setUser({
            id: data.id,
            displayName: data.display_name,
            experienceLevel: data.experience_level as 'beginner' | 'intermediate' | 'advanced' | null,
            goal: data.goal as 'strength' | 'hypertrophy' | 'general_fitness' | 'body_recomp' | null,
            equipment: data.equipment ?? [],
            locale: (data.locale as 'en' | 'fr') ?? 'en',
          })
        }
      } catch {
        // Silently fail — profile will show fallback text
      }
    })
  }, [displayName, setUser])

  function handleSignOut() {
    Alert.alert(t('auth.signOut'), t('auth.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.signOut'),
        style: 'destructive',
        onPress: async () => {
          setLoading(true)
          try {
            await signOut()
          } finally {
            setLoading(false)
          }
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
