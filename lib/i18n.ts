import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'

import en from '@/locales/en.json'
import fr from '@/locales/fr.json'

const deviceLocale = getLocales()[0]?.languageCode ?? 'en'

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

export default i18n
