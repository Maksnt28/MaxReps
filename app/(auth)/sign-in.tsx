import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { YStack, XStack, Text, Button, Spinner, Theme } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as AppleAuthentication from 'expo-apple-authentication'
import { signInWithGoogle, signInWithApple, type AuthResult } from '@/lib/auth'

export default function SignInScreen() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [appleAvailable, setAppleAvailable] = useState(false)

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable)
    }
  }, [])

  async function handleSignIn(provider: 'google' | 'apple') {
    setLoading(provider)
    setError(null)

    let result: AuthResult
    if (provider === 'google') {
      result = await signInWithGoogle()
    } else {
      result = await signInWithApple()
    }

    if (result.type === 'error') {
      setError(result.message)
    }
    // 'success' → onAuthStateChange in root layout handles navigation
    // 'cancelled' → stay on screen, no message

    setLoading(null)
  }

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="$background"
      paddingHorizontal="$6"
      gap="$4"
    >
      <Text color="$color" fontSize={36} fontWeight="800">
        MaxReps
      </Text>
      <Text color="$gray10" fontSize={16} marginBottom="$8">
        {t('auth.tagline')}
      </Text>

      <Theme name="light">
        <Button
          size="$5"
          width="100%"
          disabled={loading !== null}
          onPress={() => handleSignIn('google')}
          accessibilityLabel={t('auth.signInGoogle')}
          icon={
            loading === 'google' ? (
              <Spinner />
            ) : (
              <Ionicons name="logo-google" size={20} color="#000" />
            )
          }
        >
          {t('auth.signInGoogle')}
        </Button>

        {appleAvailable && (
          <Button
            size="$5"
            width="100%"
            disabled={loading !== null}
            onPress={() => handleSignIn('apple')}
            accessibilityLabel={t('auth.signInApple')}
            icon={
              loading === 'apple' ? (
                <Spinner />
              ) : (
                <Ionicons name="logo-apple" size={22} color="#000" />
              )
            }
          >
            {t('auth.signInApple')}
          </Button>
        )}
      </Theme>

      {error && (
        <XStack
          backgroundColor="$red2"
          borderRadius="$3"
          paddingHorizontal="$4"
          paddingVertical="$3"
          width="100%"
        >
          <Text color="$red10" fontSize={14}>
            {error}
          </Text>
        </XStack>
      )}
    </YStack>
  )
}
