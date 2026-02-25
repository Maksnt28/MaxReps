import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'
import AsyncStorage from '@react-native-async-storage/async-storage'

import en from '@/locales/en.json'
import fr from '@/locales/fr.json'

const deviceLocale = getLocales()[0]?.languageCode ?? 'en'

export const LOCALE_KEY = 'maxreps-locale'
const VALID_LOCALES = ['en', 'fr']

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: deviceLocale === 'fr' ? 'fr' : 'en',
  fallbackLng: 'en',
  returnEmptyString: false,
  interpolation: {
    escapeValue: false,
  },
})

/** Read cached locale from AsyncStorage and apply it. Call before splash is hidden. */
export async function initLocale(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(LOCALE_KEY)
    if (saved && VALID_LOCALES.includes(saved)) {
      await i18n.changeLanguage(saved)
    }
  } catch {
    // AsyncStorage read failed — keep device locale
  }
}

/** Persist locale to AsyncStorage for fast cold-start. */
export async function saveLocale(locale: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCALE_KEY, locale)
  } catch {
    // Best-effort — don't crash if write fails
  }
}

export default i18n
