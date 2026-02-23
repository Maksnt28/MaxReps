import '@/lib/i18n'

import { useCallback, useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TamaguiProvider, YStack, Spinner } from 'tamagui'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import type { Session } from '@supabase/supabase-js'

import tamaguiConfig from '@/tamagui.config'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/useUserStore'
import { getTargetRoute } from '@/lib/routeGuard'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
})

function useProtectedRoute(
  session: Session | null,
  isLoading: boolean
) {
  const segments = useSegments()
  const router = useRouter()
  const isOnboarded = useUserStore((s) => s.isOnboarded)

  useEffect(() => {
    if (isLoading) return

    const target = getTargetRoute(!!session, isOnboarded, segments[0])
    if (target) {
      router.replace(target as any)
    }
  }, [session, segments, isLoading, isOnboarded, router])
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { setUser, clearUser } = useUserStore()

  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-ExtraBold': require('../assets/fonts/Inter-ExtraBold.ttf'),
  })

  const syncUserProfile = useCallback(async (s: Session) => {
    try {
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', s.user.id)
        .single()

      // 8s timeout — prevents app from hanging on expired/broken sessions
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('syncUserProfile timed out')), 8000)
      )

      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      if (error) {
        console.warn('syncUserProfile: fetch failed', error.message)
        return
      }

      if (data) {
        setUser({
          id: data.id,
          displayName: data.display_name,
          experienceLevel: data.experience_level as 'beginner' | 'intermediate' | 'advanced' | null,
          goal: data.goal as 'strength' | 'hypertrophy' | 'general_fitness' | 'body_recomp' | null,
          equipment: data.equipment ?? [],
          locale: (data.locale as 'en' | 'fr') ?? 'en',
          isOnboarded: (data as any).is_onboarded ?? false,
        })
      }
    } catch (e) {
      console.warn('syncUserProfile: unexpected error', e)
    }
  }, [setUser])

  useEffect(() => {
    // Check initial session — await sync before marking loaded
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) await syncUserProfile(session)
      setIsLoading(false)
    })

    // Listen for auth state changes — fire-and-forget sync to avoid blocking navigation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)

        if (session) {
          // Don't await — prevents hanging when Supabase client races during token exchange
          syncUserProfile(session).catch(() => {})
        } else {
          clearUser()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [syncUserProfile, clearUser])

  useProtectedRoute(session, isLoading)

  useEffect(() => {
    if (!isLoading && fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [isLoading, fontsLoaded])

  if (isLoading || !fontsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
          <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
            <Spinner size="large" color="$color" />
          </YStack>
          <StatusBar style="light" />
        </TamaguiProvider>
      </GestureHandlerRootView>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="exercise" />
            <Stack.Screen name="workout" />
            <Stack.Screen name="program" />
          </Stack>
          <StatusBar style="light" />
        </TamaguiProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
