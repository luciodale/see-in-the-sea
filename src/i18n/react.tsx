import { createContext, useContext } from 'react';
import { useTranslations, type Language, type TranslationKey } from './index';

interface I18nContextType {
  lang: Language;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: Language;
}) {
  const t = useTranslations(lang);
  return (
    <I18nContext.Provider value={{ lang, t }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
