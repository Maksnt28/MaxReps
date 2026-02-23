import { describe, it, expect } from 'vitest'
import { getTargetRoute } from '../routeGuard'

describe('getTargetRoute', () => {
  it('no session + not in auth → redirects to sign-in', () => {
    expect(getTargetRoute(false, false, '(tabs)')).toBe('/(auth)/sign-in')
  })

  it('no session + in auth → null (already there)', () => {
    expect(getTargetRoute(false, false, '(auth)')).toBeNull()
  })

  it('session + not onboarded + not in onboarding → redirects to welcome', () => {
    expect(getTargetRoute(true, false, '(tabs)')).toBe('/(onboarding)/welcome')
  })

  it('session + not onboarded + in onboarding → null (already there)', () => {
    expect(getTargetRoute(true, false, '(onboarding)')).toBeNull()
  })

  it('session + onboarded + in auth → redirects to tabs', () => {
    expect(getTargetRoute(true, true, '(auth)')).toBe('/(tabs)')
  })

  it('session + onboarded + in onboarding → redirects to tabs', () => {
    expect(getTargetRoute(true, true, '(onboarding)')).toBe('/(tabs)')
  })

  it('session + onboarded + in tabs → null (happy path)', () => {
    expect(getTargetRoute(true, true, '(tabs)')).toBeNull()
  })
})
