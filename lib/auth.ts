import { makeRedirectUri } from 'expo-auth-session'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'
import { supabase } from './supabase'

const redirectTo = makeRedirectUri({ scheme: 'maxreps', path: 'auth/callback' })

export type AuthResult =
  | { type: 'success' }
  | { type: 'cancelled' }
  | { type: 'error'; message: string }

/**
 * Google Sign-In via Supabase OAuth (browser-based flow).
 * Handles both PKCE (code in query params) and implicit (tokens in hash) flows.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    })

    if (error) return { type: 'error', message: error.message }
    if (!data.url) return { type: 'error', message: 'No OAuth URL returned' }

    // Open the browser for Google consent
    const { openAuthSessionAsync } = await import('expo-web-browser')
    const result = await openAuthSessionAsync(data.url, redirectTo)

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
