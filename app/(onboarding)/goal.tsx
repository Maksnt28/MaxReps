import { Pressable, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { ProgressDots } from '@/components/onboarding/ProgressDots'
import { SelectionCard } from '@/components/onboarding/SelectionCard'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { colors, headerButtonStyles, headerButtonIcon } from '@/lib/theme'

const GOALS = [
  { key: 'strength', value: 'strength' },
  { key: 'hypertrophy', value: 'hypertrophy' },
  { key: 'generalFitness', value: 'general_fitness' },
  { key: 'bodyRecomp', value: 'body_recomp' },
] as const

export default function GoalScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { goal, setGoal } = useOnboardingStore()

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
          <ProgressDots currentStep={3} totalSteps={4} />

          <AppText preset="pageTitle" fontSize={28} lineHeight={36} color={colors.gray12} textAlign="center">
            {t('onboarding.goal.title')}
          </AppText>
          <AppText preset="body" color={colors.gray8} textAlign="center" marginTop={8} marginBottom={32}>
            {t('onboarding.goal.subtitle')}
          </AppText>

          <YStack gap={12}>
            {GOALS.map(({ key, value }) => (
              <SelectionCard
                key={key}
                label={t(`onboarding.goal.${key}`)}
                description={t(`onboarding.goal.${key}Desc`)}
                selected={goal === value}
                onPress={() => setGoal(value)}
              />
            ))}
          </YStack>
        </View>

        <View style={styles.footer}>
          <AppButton
            variant="primary"
            fullWidth
            onPress={() => router.push('/(onboarding)/equipment' as any)}
            accessibilityLabel={t('onboarding.continue')}
          >
            {t('onboarding.continue')}
          </AppButton>
          <Pressable
            onPress={() => router.push('/(onboarding)/equipment' as any)}
            accessibilityLabel={t('onboarding.skip')}
            accessibilityRole="button"
            style={styles.skipButton}
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
  footer: {
    paddingBottom: 16,
    alignItems: 'center',
    gap: 16,
  },
  skipButton: {
    paddingVertical: 8,
  },
})
