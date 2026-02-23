import 'react-native-url-polyfill/auto'

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import * as SecureStore from 'expo-secure-store'

/**
 * SecureStore adapter that handles values larger than iOS's 2048-byte keychain limit.
 * Splits large values into numbered chunks and reassembles on read.
 */
const CHUNK_SIZE = 2048
const CHUNKED_MARKER = '__chunked__'

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const value = await SecureStore.getItemAsync(key)
    if (value !== CHUNKED_MARKER) return value

    const chunks: string[] = []
    for (let i = 0; ; i++) {
      const chunk = await SecureStore.getItemAsync(`${key}_${i}`)
      if (chunk === null) break
      chunks.push(chunk)
    }
    return chunks.length > 0 ? chunks.join('') : null
  },

  setItem: async (key: string, value: string): Promise<void> => {
    // Clean up any previous chunks first
    await ExpoSecureStoreAdapter.removeItem(key)

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value)
      return
    }

    // Store marker + chunks
    await SecureStore.setItemAsync(key, CHUNKED_MARKER)
    for (let i = 0; i * CHUNK_SIZE < value.length; i++) {
      await SecureStore.setItemAsync(
        `${key}_${i}`,
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      )
    }
  },

  removeItem: async (key: string): Promise<void> => {
    // Delete chunks if they exist
    for (let i = 0; ; i++) {
      const chunkKey = `${key}_${i}`
      const chunk = await SecureStore.getItemAsync(chunkKey)
      if (chunk === null) break
      await SecureStore.deleteItemAsync(chunkKey)
    }
    await SecureStore.deleteItemAsync(key)
  },
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
})
