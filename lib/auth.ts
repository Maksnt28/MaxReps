import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'
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
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      headers: { apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '' },
    })
    return res.ok
  } catch {
    return false
  }
}

/** Run the OAuth browser session and extract session tokens. */
async function attemptOAuthSession(oauthUrl: string): Promise<AuthResult> {
  const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectTo)

  if (result.type !== 'success') return { type: 'cancelled' }

  const url = new URL(result.url)

  // PKCE flow: authorization code in query params
  const code = url.searchParams.get('code')
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) return { type: 'error', message: exchangeError.message }
    return { type: 'success' }
  }

  // Implicit flow fallback: tokens in URL hash fragment
  const params = new URLSearchParams(url.hash.substring(1))
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')

  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (sessionError) return { type: 'error', message: sessionError.message }
    return { type: 'success' }
  }

  return { type: 'error', message: 'No auth code or tokens in callback URL' }
}

/**
 * Google Sign-In via Supabase OAuth (browser-based flow).
 * Includes pre-flight connectivity check and uses ephemeral browser sessions
 * to avoid stale SafariViewService state (Xcode beta simulator workaround).
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    // Pre-flight: verify server is reachable before opening browser
    const reachable = await checkConnectivity()
    if (!reachable) {
      return { type: 'error', message: 'Cannot reach authentication server. Check your network connection.' }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    })

    if (error) return { type: 'error', message: error.message }
    if (!data.url) return { type: 'error', message: 'No OAuth URL returned' }

    // Dismiss any lingering browser session before starting a new one
    await WebBrowser.dismissAuthSession()

    return await attemptOAuthSession(data.url)
  } catch (e) {
    return { type: 'error', message: e instanceof Error ? e.message : 'Unknown error' }
  }
}

/**
 * Apple Sign-In via native sheet (expo-apple-authentication).
 * Uses signInWithIdToken to exchange the Apple identity token with Supabase.
 */
export async function signInWithApple(): Promise<AuthResult> {
  try {
    const nonce = Crypto.randomUUID()
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      nonce
    )

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    })

    if (!credential.identityToken) {
      return { type: 'error', message: 'No identity token from Apple' }
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce,
    })

    if (error) return { type: 'error', message: error.message }

    return { type: 'success' }
  } catch (e: unknown) {
    // User cancelled the native Apple sheet
    if (e && typeof e === 'object' && 'code' in e && e.code === 'ERR_REQUEST_CANCELED') {
      return { type: 'cancelled' }
    }
    return { type: 'error', message: e instanceof Error ? e.message : 'Unknown error' }
  }
}

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
