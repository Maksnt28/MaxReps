import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn } from 'react-native-reanimated'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { ProgressDots } from '@/components/onboarding/ProgressDots'
import { colors, accent } from '@/lib/theme'

export default function WelcomeScreen() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top', 'bottom']}>
      <YStack flex={1} paddingHorizontal={24} paddingTop={24}>
        <ProgressDots currentStep={1} totalSteps={4} />

        <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
          <AppText preset="pageTitle" fontSize={28} lineHeight={36} color={colors.gray12} textAlign="center">
            {t('onboarding.welcome.title')}
          </AppText>
          <AppText preset="body" color={colors.gray8} textAlign="center" marginTop={8} marginBottom={40}>
            {t('onboarding.welcome.subtitle')}
          </AppText>

          <YStack gap={24}>
            <FeatureRow
              icon="flash-outline"
              title={t('onboarding.welcome.feature1Title')}
              description={t('onboarding.welcome.feature1Desc')}
            />
            <FeatureRow
              icon="trending-up-outline"
              title={t('onboarding.welcome.feature2Title')}
              description={t('onboarding.welcome.feature2Desc')}
            />
            <FeatureRow
              icon="stats-chart-outline"
              title={t('onboarding.welcome.feature3Title')}
              description={t('onboarding.welcome.feature3Desc')}
            />
          </YStack>
        </Animated.View>

        <View style={styles.footer}>
          <AppButton
            variant="primary"
            fullWidth
            onPress={() => router.push('/(onboarding)/experience' as any)}
            accessibilityLabel={t('onboarding.welcome.cta')}
          >
            {t('onboarding.welcome.cta')}
          </AppButton>
        </View>
      </YStack>
    </SafeAreaView>
  )
}

function FeatureRow({ icon, title, description }: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  description: string
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={22} color={accent.accent} />
      </View>
      <View style={styles.featureText}>
        <AppText preset="exerciseName" color={colors.gray11}>
          {title}
        </AppText>
        <AppText preset="caption" color={colors.gray7} marginTop={2}>
          {description}
        </AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(59,130,246,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  footer: {
    paddingBottom: 16,
  },
})
