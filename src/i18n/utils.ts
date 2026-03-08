import {
  backendTranslations,
  type BackendTranslationKey,
} from './backend-translations';
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
 * Generate hreflang alternates from the current URL.
 * Strips any existing locale prefix, then builds both /en and /it variants.
 */
export function getAlternates(url: URL) {
  const pathname = url.pathname;
  const basePath = pathname.startsWith('/it/')
    ? pathname.slice(3)
    : pathname === '/it'
      ? '/'
      : pathname;

  return [
    { hrefLang: 'it', href: new URL(`/it${basePath === '/' ? '' : basePath}`, url).toString() },
    { hrefLang: 'x-default', href: new URL(basePath, url).toString() },
  ];
}

/**
 * Check if a language is supported
 */
export function isValidLanguage(lang: string): lang is Language {
  return lang in translations;
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

/**
 * Get language-aware redirect URL for authentication flows
 */
export function getLanguageAwareRedirectUrl(
  basePath: string,
  lang?: Language
): string {
  // If no language provided, try to detect from current URL
  if (!lang) {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const detectedLang = getLangFromUrl(
        new URL(currentPath, window.location.origin)
      );
      return getLocalizedPath(basePath, detectedLang);
    }
    return getLocalizedPath(basePath, defaultLang);
  }

  return getLocalizedPath(basePath, lang);
}

/**
 * Get language-aware redirect URL for sign out
 */
export function getLanguageAwareSignOutUrl(lang?: Language): string {
  return getLanguageAwareRedirectUrl('/', lang);
}

/**
 * Get the backend translation function for a specific language
 */
export function useBackendTranslations(lang: Language = defaultLang) {
  return function bt(key: BackendTranslationKey): string {
    return (
      backendTranslations[lang][key] ||
      backendTranslations[defaultLang][key] ||
      key
    );
  };
}

/**
 * Get backend translation for server-side use
 * @param key - The translation key
 * @param request - Optional request to detect language from
 * @returns The translated string
 */
export function getBackendTranslation(
  key: BackendTranslationKey,
  request?: Request
): string {
  let lang: Language = defaultLang;

  // Try to detect language from request if provided
  if (request) {
    const referer = request.headers.get('referer');
    if (referer && referer.includes('/it/')) {
      lang = 'it';
    }
  }

  return (
    backendTranslations[lang][key] ||
    backendTranslations[defaultLang][key] ||
    key
  );
}
