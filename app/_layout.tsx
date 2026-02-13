import '@/lib/i18n'

import { useCallback, useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TamaguiProvider, YStack, Spinner } from 'tamagui'
import type { Session } from '@supabase/supabase-js'

import tamaguiConfig from '@/tamagui.config'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/useUserStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
})

function useProtectedRoute(session: Session | null, isLoading: boolean) {
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in')
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [session, segments, isLoading, router])
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { setUser, clearUser } = useUserStore()

  const syncUserProfile = useCallback(async (s: Session) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', s.user.id)
        .single()

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
        })
      }
    } catch (e) {
      console.warn('syncUserProfile: unexpected error', e)
    }
  }, [setUser])

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) syncUserProfile(session)
      setIsLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)

        if (session) {
          // Fire-and-forget — errors caught inside syncUserProfile
          syncUserProfile(session)
        } else {
          clearUser()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [syncUserProfile, clearUser])

  useProtectedRoute(session, isLoading)

  if (isLoading) {
    return (
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
          <Spinner size="large" color="$color" />
        </YStack>
        <StatusBar style="light" />
      </TamaguiProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="light" />
      </TamaguiProvider>
    </QueryClientProvider>
  )
}
