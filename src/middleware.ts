import { defineMiddleware } from 'astro:middleware';
import { getLangFromUrl, isValidLanguage } from './i18n';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, redirect } = context;

  // Get the language from the URL
  const currentLang = getLangFromUrl(url);

  // If the language in the URL is not valid, redirect to default language
  if (
    url.pathname.startsWith('/') &&
    url.pathname.split('/')[1] &&
    !isValidLanguage(url.pathname.split('/')[1])
  ) {
    // Only redirect if it looks like a language code (2 characters)
    const potentialLang = url.pathname.split('/')[1];
    if (potentialLang.length === 2) {
      const newPath = url.pathname.replace(`/${potentialLang}`, '');
      return redirect(newPath || '/');
    }
  }

  // Set the language in the context for easy access in components
  context.locals.lang = currentLang;

  return next();
});
