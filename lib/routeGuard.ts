export function getTargetRoute(
  hasSession: boolean,
  isOnboarded: boolean,
  currentSegment: string | undefined
): string | null {
  const inAuth = currentSegment === '(auth)'
  const inOnboarding = currentSegment === '(onboarding)'

  if (!hasSession && !inAuth) return '/(auth)/sign-in'
  if (hasSession && !isOnboarded && !inOnboarding) return '/(onboarding)/welcome'
  if (hasSession && isOnboarded && (inAuth || inOnboarding)) return '/(tabs)'
  return null // no redirect needed
}
