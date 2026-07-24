import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';

export type Language = 'en' | 'ar';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

function applyDocumentLanguage(language: Language) {
  const root = document.documentElement;
  root.lang = language;
  root.dir = language === 'ar' ? 'rtl' : 'ltr';
  root.classList.toggle('font-arabic', language === 'ar');
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null;
    const initial = saved === 'ar' || saved === 'en' ? saved : 'en';
    setLanguageState(initial);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('language', language);
    void i18n.changeLanguage(language);
    applyDocumentLanguage(language);
  }, [language, isInitialized]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isRtl: language === 'ar',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
