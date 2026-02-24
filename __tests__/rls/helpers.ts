import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const TEST_EMAIL_PATTERN = 'rls-test-'
const TEST_EMAIL_DOMAIN = '@test.maxreps.local'
const TEST_PASSWORD = 'test-password-rls-2026!'

const TEST_USER_A_EMAIL = `${TEST_EMAIL_PATTERN}a${TEST_EMAIL_DOMAIN}`
const TEST_USER_B_EMAIL = `${TEST_EMAIL_PATTERN}b${TEST_EMAIL_DOMAIN}`

function getEnvOrThrow(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing env var: ${key}`)
  return value
}

/** Admin client — bypasses RLS. For setup/teardown only. */
export function createAdminClient() {
  return createClient(
    getEnvOrThrow('SUPABASE_URL'),
    getEnvOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/** Anon client — subject to RLS. Simulates a real app user. */
function createAnonClient() {
  return createClient(
    getEnvOrThrow('SUPABASE_URL'),
    getEnvOrThrow('SUPABASE_ANON_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export let adminClient: SupabaseClient
export let clientA: SupabaseClient
export let clientB: SupabaseClient
export let userAId: string
export let userBId: string

/**
 * Cleans up any stale test users matching the rls-test-* pattern.
 * Makes tests self-healing after crashes.
 */
async function cleanupStaleUsers(admin: SupabaseClient) {
  const { data } = await admin.auth.admin.listUsers()
  const staleUsers = (data?.users ?? []).filter((u) =>
    u.email?.startsWith(TEST_EMAIL_PATTERN) && u.email?.endsWith(TEST_EMAIL_DOMAIN)
  )

  for (const user of staleUsers) {
    // Delete from public.users first — cascades to all child tables
    await admin.from('users').delete().eq('id', user.id)
    // Then delete auth user — no FK from public.users to auth.users (trigger-based only)
    await admin.auth.admin.deleteUser(user.id)
  }
}

/**
 * Creates two test users and signs them into separate anon clients.
 * Each client gets a real JWT with a distinct auth.uid().
 */
export async function createTestUsers() {
  adminClient = createAdminClient()

  // Self-healing: clean up any stale test data from previous crashed runs
  await cleanupStaleUsers(adminClient)

  // Create User A
  const { data: dataA, error: errorA } = await adminClient.auth.admin.createUser({
    email: TEST_USER_A_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  })
  if (errorA) throw new Error(`Failed to create User A: ${errorA.message}`)
  userAId = dataA.user.id

  // Create User B
  const { data: dataB, error: errorB } = await adminClient.auth.admin.createUser({
    email: TEST_USER_B_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  })
  if (errorB) throw new Error(`Failed to create User B: ${errorB.message}`)
  userBId = dataB.user.id

  // Sign in anon clients
  clientA = createAnonClient()
  const { error: signInA } = await clientA.auth.signInWithPassword({
    email: TEST_USER_A_EMAIL,
    password: TEST_PASSWORD,
  })
  if (signInA) throw new Error(`Failed to sign in User A: ${signInA.message}`)

  clientB = createAnonClient()
  const { error: signInB } = await clientB.auth.signInWithPassword({
    email: TEST_USER_B_EMAIL,
    password: TEST_PASSWORD,
  })
  if (signInB) throw new Error(`Failed to sign in User B: ${signInB.message}`)
}

/**
 * Deletes test users and all their data.
 * public.users delete cascades to all child tables (programs, sessions, etc.).
 * Auth user deletion is separate — no FK, only trigger-based relationship.
 */
export async function deleteTestUsers() {
  if (!adminClient) return

  for (const userId of [userAId, userBId]) {
    if (!userId) continue
    await adminClient.from('users').delete().eq('id', userId)
    await adminClient.auth.admin.deleteUser(userId)
  }
}
