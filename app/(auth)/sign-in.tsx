import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { YStack, XStack, Spinner, Theme, Button } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as AppleAuthentication from 'expo-apple-authentication'
import { signInWithGoogle, signInWithApple, type AuthResult } from '@/lib/auth'
import { AppText } from '@/components/ui/AppText'
import { colors } from '@/lib/theme'

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

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function handleSignIn(provider: 'google' | 'apple') {
    setLoading(provider)
    setError(null)

    // 15s timeout safeguard — resets UI if auth flow hangs
    let timedOut = false
    timeoutRef.current = setTimeout(() => {
      timedOut = true
      console.log('[AUTH] timeout: 15s exceeded, resetting loading state')
      setLoading(null)
      setError(t('auth.timeout'))
    }, 15_000)

    try {
      let result: AuthResult
      if (provider === 'google') {
        result = await signInWithGoogle()
      } else {
        result = await signInWithApple()
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      // If timeout already fired, don't overwrite its error
      if (timedOut) return

      if (result.type === 'error') {
        setError(result.message)
      }
    } catch (e) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (!timedOut) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      }
    }

    if (!timedOut) setLoading(null)
  }

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor={colors.gray1}
      paddingHorizontal={24}
      gap={16}
    >
      <AppText preset="pageTitle" color={colors.accent} fontSize={36} lineHeight={46}>
        MaxReps
      </AppText>
      <AppText preset="body" color={colors.gray8} marginBottom={32}>
        {t('auth.tagline')}
      </AppText>

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
          backgroundColor="rgba(255,90,106,0.1)"
          borderRadius={12}
          paddingHorizontal={16}
          paddingVertical={12}
          width="100%"
        >
          <AppText preset="caption" color={colors.regression}>
            {error}
          </AppText>
        </XStack>
      )}
    </YStack>
  )
}
