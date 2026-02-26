import i18n, { initLocale, saveLocale } from '@/lib/i18n'

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
import { useUserStore, type UserRow } from '@/stores/useUserStore'
import type { ExperienceLevel, Goal, Sex } from '@/lib/types'
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
        const row = data as UserRow
        const locale = (row.locale as 'en' | 'fr') ?? 'en'
        setUser({
          id: row.id,
          displayName: row.display_name,
          experienceLevel: row.experience_level as ExperienceLevel | null,
          goals: (row.goals as Goal[]) ?? [],
          equipment: row.equipment ?? [],
          locale,
          isOnboarded: row.is_onboarded ?? false,
          limitations: row.limitations ?? [],
          daysPerWeek: row.schedule?.days_per_week ?? null,
          sex: (row.sex as Sex | null) ?? null,
          age: row.age ?? null,
          heightCm: row.height_cm ?? null,
          weightKg: row.weight_kg ?? null,
          defaultRestSeconds: row.default_rest_seconds ?? null,
          restSecondsSuccess: row.rest_seconds_success ?? null,
          restSecondsFailure: row.rest_seconds_failure ?? null,
        })
        i18n.changeLanguage(locale)
        saveLocale(locale)
      }
    } catch (e) {
      console.warn('syncUserProfile: unexpected error', e)
    }
  }, [setUser])

  useEffect(() => {
    // Check initial session — await sync before marking loaded
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // Restore cached locale instantly (~5ms) before any network calls
      await initLocale()
      setSession(session)
      if (session) {
        await syncUserProfile(session)
        // Fire-and-forget prefetch for home screen CTA
        const { nextProgramDayQueryKey, nextProgramDayQueryFn } = require('@/hooks/useNextProgramDay')
        queryClient.prefetchQuery({
          queryKey: nextProgramDayQueryKey(session.user.id),
          queryFn: () => nextProgramDayQueryFn(session.user.id),
        })
      }
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
