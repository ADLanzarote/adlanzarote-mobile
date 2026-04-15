import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemeColors } from '../theme/colors';

interface ThemeContextType {
  isDark: boolean;
  language: 'es' | 'pt';
  colors: ReturnType<typeof getThemeColors>;
  toggleTheme: () => void;
  setLanguage: (lang: 'es' | 'pt') => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguageState] = useState<'es' | 'pt'>('es');

  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@adlanzarote_theme');
        const savedLang = await AsyncStorage.getItem('@adlanzarote_lang');
        if (savedTheme) setIsDark(savedTheme === 'dark');
        if (savedLang) setLanguageState(savedLang as 'es' | 'pt');
      } catch {}
    })();
  }, []);

  const toggleTheme = async () => {
    const newVal = !isDark;
    setIsDark(newVal);
    await AsyncStorage.setItem('@adlanzarote_theme', newVal ? 'dark' : 'light');
  };

  const setLanguage = async (lang: 'es' | 'pt') => {
    setLanguageState(lang);
    await AsyncStorage.setItem('@adlanzarote_lang', lang);
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      language,
      colors: getThemeColors(isDark),
      toggleTheme,
      setLanguage,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
