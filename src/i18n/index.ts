// Main i18n exports for easy importing
export {
  defaultLang,
  languages,
  translations,
  type Language,
  type TranslationKey,
} from './translations';
export {
  getAlternateLanguage,
  getCurrentLocale,
  getLangFromUrl,
  getLanguages,
  getLocalizedPath,
  getLocalizedPathForLanguage,
  isValidLanguage,
  useTranslations,
} from './utils';
