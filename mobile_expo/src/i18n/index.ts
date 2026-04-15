import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import es from './es';
import pt from './pt';

const LANG_KEY = '@adlanzarote_lang';

export const getSavedLanguage = async (): Promise<string> => {
  try {
    const lang = await AsyncStorage.getItem(LANG_KEY);
    return lang || 'es';
  } catch {
    return 'es';
  }
};

export const saveLanguage = async (lang: string) => {
  await AsyncStorage.setItem(LANG_KEY, lang);
};

export const initI18n = async () => {
  const savedLang = await getSavedLanguage();
  if (i18next.isInitialized) return;
  await i18next.use(initReactI18next).init({
    lng: savedLang,
    fallbackLng: 'es',
    resources: {
      es: { translation: es },
      pt: { translation: pt },
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
};

export default i18next;
