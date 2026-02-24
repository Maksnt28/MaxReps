import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from './supabase'

const redirectTo = makeRedirectUri({ scheme: 'maxreps', path: 'auth/callback' })

export type AuthResult =
  | { type: 'success' }
  | { type: 'cancelled' }
  | { type: 'error'; message: string }

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''

/** Verify the Supabase server is reachable before attempting OAuth. */
async function checkConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      headers: { apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '' },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

/** Race a promise against a timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ])
}

/** Run the OAuth browser session and extract session tokens. */
async function attemptOAuthSession(oauthUrl: string): Promise<AuthResult> {
  const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectTo)

  if (result.type !== 'success') return { type: 'cancelled' }

  const url = new URL(result.url)

  // PKCE flow: authorization code in query params
  const code = url.searchParams.get('code')
  if (code) {
    const { error: exchangeError } = await withTimeout(
      supabase.auth.exchangeCodeForSession(code),
      10_000,
      'exchangeCodeForSession'
    )
    if (exchangeError) return { type: 'error', message: exchangeError.message }
    return { type: 'success' }
  }

  // Implicit flow fallback: tokens in URL hash fragment
  const params = new URLSearchParams(url.hash.substring(1))
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')

  if (accessToken && refreshToken) {
    const { error: sessionError } = await withTimeout(
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
      10_000,
      'setSession'
    )
    if (sessionError) return { type: 'error', message: sessionError.message }
    return { type: 'success' }
  }

  return { type: 'error', message: 'No auth code or tokens in callback URL' }
}

/** Browser-based OAuth sign-in with pre-flight connectivity check. */
async function signInWithOAuth(provider: 'google' | 'apple'): Promise<AuthResult> {
  try {
    const reachable = await checkConnectivity()
    if (!reachable) {
      return { type: 'error', message: 'Cannot reach authentication server. Check your network connection.' }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    })

    if (error) return { type: 'error', message: error.message }
    if (!data.url) return { type: 'error', message: 'No OAuth URL returned' }

    return await attemptOAuthSession(data.url)
  } catch (e) {
    return { type: 'error', message: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export const signInWithGoogle = () => signInWithOAuth('google')
export const signInWithApple = () => signInWithOAuth('apple')

/**
 * Sign out the current user.
 * Uses scope: 'local' to avoid server-side revocation call (which can hang).
 */
export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch {
    // Force-clear even if signOut throws — onAuthStateChange handles store cleanup
  }
}
