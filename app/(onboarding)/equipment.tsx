import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack, XStack } from 'tamagui'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { ProgressDots } from '@/components/onboarding/ProgressDots'
import { SelectionCard } from '@/components/onboarding/SelectionCard'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useUserStore } from '@/stores/useUserStore'
import { supabase } from '@/lib/supabase'
import { colors, headerButtonStyles, headerButtonIcon } from '@/lib/theme'

const EQUIPMENT = [
  'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'bands', 'kettlebell',
] as const

export default function EquipmentScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { equipment, toggleEquipment } = useOnboardingStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function completeOnboarding() {
    setLoading(true)
    setError(null)

    const { id: userId, setUser } = useUserStore.getState()
    const { experienceLevel, goal, equipment: equip, reset } = useOnboardingStore.getState()

    // Only include non-null fields in the update payload
    const payload: Record<string, unknown> = { is_onboarded: true }
    if (experienceLevel) payload.experience_level = experienceLevel
    if (goal) payload.goal = goal
    if (equip.length > 0) payload.equipment = equip

    if (!userId) {
      setError(t('onboarding.equipment.error'))
      setLoading(false)
      return
    }

    const { error: dbError } = await supabase
      .from('users')
      .update(payload as any)
      .eq('id', userId)

    if (dbError) {
      setError(t('onboarding.equipment.error'))
      setLoading(false)
      return
    }

    // Sync both stores
    setUser({ experienceLevel, goal, equipment: equip, isOnboarded: true })
    reset()
    // No router.replace — guard handles the redirect to /(tabs)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top', 'bottom']}>
      <YStack flex={1} paddingHorizontal={24} paddingTop={16}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('common.goBack')}
          accessibilityRole="button"
          style={headerButtonStyles.navButton}
        >
          <Ionicons name="chevron-back" size={headerButtonIcon.size} color={headerButtonIcon.color} />
        </Pressable>

        <View style={styles.content}>
          <ProgressDots currentStep={4} totalSteps={4} />

          <AppText preset="pageTitle" fontSize={28} lineHeight={36} color={colors.gray12} textAlign="center">
            {t('onboarding.equipment.title')}
          </AppText>
          <AppText preset="body" color={colors.gray8} textAlign="center" marginTop={8} marginBottom={32}>
            {t('onboarding.equipment.subtitle')}
          </AppText>

          <View style={styles.grid}>
            {EQUIPMENT.map((item) => (
              <View key={item} style={styles.gridItem}>
                <SelectionCard
                  compact
                  label={t(`onboarding.equipment.${item}`)}
                  selected={equipment.includes(item)}
                  onPress={() => toggleEquipment(item)}
                />
              </View>
            ))}
          </View>

          {error && (
            <XStack
              backgroundColor="rgba(255,90,106,0.1)"
              borderRadius={12}
              paddingHorizontal={16}
              paddingVertical={12}
              marginTop={16}
            >
              <AppText preset="caption" color={colors.regression}>
                {error}
              </AppText>
            </XStack>
          )}
        </View>

        <View style={styles.footer}>
          <AppButton
            variant="primary"
            fullWidth
            onPress={completeOnboarding}
            loading={loading}
            disabled={loading}
            accessibilityLabel={t('onboarding.continue')}
          >
            {t('onboarding.continue')}
          </AppButton>
          <Pressable
            onPress={completeOnboarding}
            disabled={loading}
            accessibilityLabel={t('onboarding.skip')}
            accessibilityRole="button"
            style={[styles.skipButton, loading && { opacity: 0.5 }]}
          >
            <AppText preset="caption" color={colors.gray7}>
              {t('onboarding.skip')}
            </AppText>
          </Pressable>
        </View>
      </YStack>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '48%',
  },
  footer: {
    paddingBottom: 16,
    alignItems: 'center',
    gap: 16,
  },
  skipButton: {
    paddingVertical: 8,
  },
})
