import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock AsyncStorage before importing the module
const mockGetItem = vi.fn()
const mockSetItem = vi.fn()
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: (...args: unknown[]) => mockGetItem(...args),
    setItem: (...args: unknown[]) => mockSetItem(...args),
  },
}))

// Mock i18next
const mockChangeLanguage = vi.fn().mockResolvedValue(undefined)
vi.mock('i18next', () => ({
  default: {
    use: vi.fn().mockReturnThis(),
    init: vi.fn(),
    changeLanguage: (...args: unknown[]) => mockChangeLanguage(...args),
    language: 'en',
  },
}))

vi.mock('react-i18next', () => ({
  initReactI18next: {},
}))

vi.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}))

vi.mock('@/locales/en.json', () => ({ default: {} }))
vi.mock('@/locales/fr.json', () => ({ default: {} }))

import { initLocale, saveLocale, LOCALE_KEY } from '../i18n'

describe('i18n persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initLocale', () => {
    it('applies saved locale from AsyncStorage', async () => {
      mockGetItem.mockResolvedValue('fr')
      await initLocale()
      expect(mockGetItem).toHaveBeenCalledWith(LOCALE_KEY)
      expect(mockChangeLanguage).toHaveBeenCalledWith('fr')
    })

    it('does nothing when no saved locale exists', async () => {
      mockGetItem.mockResolvedValue(null)
      await initLocale()
      expect(mockGetItem).toHaveBeenCalledWith(LOCALE_KEY)
      expect(mockChangeLanguage).not.toHaveBeenCalled()
    })

    it('ignores invalid saved locale', async () => {
      mockGetItem.mockResolvedValue('de')
      await initLocale()
      expect(mockChangeLanguage).not.toHaveBeenCalled()
    })

    it('handles AsyncStorage read failure gracefully', async () => {
      mockGetItem.mockRejectedValue(new Error('storage error'))
      await expect(initLocale()).resolves.toBeUndefined()
      expect(mockChangeLanguage).not.toHaveBeenCalled()
    })
  })

  describe('saveLocale', () => {
    it('writes locale to AsyncStorage', async () => {
      mockSetItem.mockResolvedValue(undefined)
      await saveLocale('fr')
      expect(mockSetItem).toHaveBeenCalledWith(LOCALE_KEY, 'fr')
    })

    it('handles AsyncStorage write failure gracefully', async () => {
      mockSetItem.mockRejectedValue(new Error('storage error'))
      await expect(saveLocale('fr')).resolves.toBeUndefined()
    })
  })
})
