import {
  defaultLang,
  translations,
  type Language,
  type TranslationKey,
} from './translations';

/**
 * Get the language from the current URL
 */
export function getLangFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split('/');
  if (lang in translations) return lang as Language;
  return defaultLang;
}

/**
 * Get the translation function for a specific language
 */
export function useTranslations(lang: Language) {
  return function t(key: TranslationKey): string {
    return translations[lang][key] || translations[defaultLang][key] || key;
  };
}

/**
 * Get current language from Astro request
 */
export function getCurrentLocale(request?: Request): Language {
  if (!request) return defaultLang;

  const url = new URL(request.url);
  return getLangFromUrl(url);
}

/**
 * Generate URL with language prefix
 */
export function getLocalizedPath(
  path: string,
  lang: Language = defaultLang
): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // If it's the default language and we don't want to show it, return path without prefix
  if (lang === defaultLang) {
    return `/${cleanPath}`;
  }

  // For non-default languages, add the language prefix
  return `/${lang}/${cleanPath}`;
}

/**
 * Get all available languages with their labels
 */
export function getLanguages() {
  return Object.entries(translations).map(([code, _]) => ({
    code: code as Language,
    label: code === 'en' ? 'English' : 'Italiano',
    isDefault: code === defaultLang,
  }));
}

/**
 * Check if a language is supported
 */
export function isValidLanguage(lang: string): lang is Language {
  return lang in translations;
}

/**
 * Get the alternate language (for language switcher)
 */
export function getAlternateLanguage(currentLang: Language): Language {
  return currentLang === 'en' ? 'it' : 'en';
}

/**
 * Get localized path for current page in different language
 */
export function getLocalizedPathForLanguage(
  currentUrl: URL,
  targetLang: Language
): string {
  const currentLang = getLangFromUrl(currentUrl);
  let pathname = currentUrl.pathname;

  // Remove current language prefix if it exists
  if (currentLang !== defaultLang) {
    pathname = pathname.replace(`/${currentLang}`, '') || '/';
  }

  // Add target language prefix if it's not the default
  if (targetLang !== defaultLang) {
    pathname = `/${targetLang}${pathname}`;
  }

  return pathname;
}

/**
 * Get translated category name
 */
export function getCategoryName(
  categoryId: string,
  categoryName: string,
  lang: Language
): string {
  const translationKey = `category.${categoryId}` as TranslationKey;

  // Check if translation exists, otherwise fallback to original name
  const translated = translations[lang][translationKey];
  return translated || categoryName;
}

/**
 * Get translated result type
 */
export function getResultName(result: string, lang: Language): string {
  // Handle the case where result contains a category name followed by "Winner"
  if (result.endsWith('Winner')) {
    const categoryPart = result.slice(0, -7).trim(); // Remove " Winner" and trim
    const translatedCategory = getCategoryName(
      categoryPart.toLowerCase(),
      categoryPart,
      lang
    );
    const translatedWinner = translations[lang]['category.winner'];
    return `${translatedCategory} ${translatedWinner}`;
  }

  // Handle other result types (First Place, Second Place, etc.)
  const translationKey = `result.${result
    .toLowerCase()
    .replace(/\s+/g, '-')}` as TranslationKey;

  // Check if translation exists, otherwise fallback to original
  const translated = translations[lang][translationKey];
  return translated || result;
}
