import { useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack, XStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/useUserStore'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { AppCard } from '@/components/ui/AppCard'
import { colors, accent, radii } from '@/lib/theme'

export default function ProfileScreen() {
  const { t, i18n } = useTranslation()
  const { displayName, setUser } = useUserStore()
  const [loading, setLoading] = useState(false)
  const currentLang = i18n.language

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
        <YStack flex={1} paddingHorizontal={16} paddingTop={24} gap={24}>
          <AppText preset="exerciseName" color={colors.gray11} textAlign="center">
            {displayName ?? t('tabs.profile')}
          </AppText>

          {/* Language selector */}
          <AppCard>
            <AppText preset="caption" color={colors.gray7} marginBottom={8}>
              {t('profile.language')}
            </AppText>
            <XStack gap={8}>
              <Pressable
                onPress={() => i18n.changeLanguage('en')}
                accessibilityLabel={t('profile.languageEn')}
                accessibilityRole="button"
                accessibilityState={{ selected: currentLang === 'en' }}
                style={[
                  styles.langPill,
                  currentLang === 'en' && styles.langPillSelected,
                ]}
              >
                <AppText
                  preset="caption"
                  style={[
                    styles.langText,
                    currentLang === 'en' && styles.langTextSelected,
                  ]}
                >
                  {t('profile.languageEn')}
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => i18n.changeLanguage('fr')}
                accessibilityLabel={t('profile.languageFr')}
                accessibilityRole="button"
                accessibilityState={{ selected: currentLang === 'fr' }}
                style={[
                  styles.langPill,
                  currentLang === 'fr' && styles.langPillSelected,
                ]}
              >
                <AppText
                  preset="caption"
                  style={[
                    styles.langText,
                    currentLang === 'fr' && styles.langTextSelected,
                  ]}
                >
                  {t('profile.languageFr')}
                </AppText>
              </Pressable>
            </XStack>
          </AppCard>

          <YStack flex={1} />

          <YStack alignItems="center" paddingBottom={120}>
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
      </YStack>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  langPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.button,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  langPillSelected: {
    backgroundColor: accent.accent,
  },
  langText: {
    color: colors.gray7,
  },
  langTextSelected: {
    color: '#FFFFFF',
  },
})
