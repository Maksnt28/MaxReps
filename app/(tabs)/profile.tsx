import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/useUserStore'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { colors } from '@/lib/theme'

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
      <YStack flex={1} backgroundColor={colors.gray1}>
        <YStack paddingHorizontal={16} paddingTop={16} paddingBottom={8}>
          <AppText fontSize={28} fontWeight="800" color={colors.gray12}>
            {t('tabs.profile')}
          </AppText>
        </YStack>
        <YStack flex={1} alignItems="center" justifyContent="center" gap={16} paddingHorizontal={24}>
          <AppText preset="exerciseName" color={colors.gray11}>
            {displayName ?? t('tabs.profile')}
          </AppText>

          <AppButton
            variant="destructive"
            onPress={handleSignOut}
            disabled={loading}
            loading={loading}
            accessibilityLabel={t('auth.signOut')}
          >
            {t('auth.signOut')}
          </AppButton>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
