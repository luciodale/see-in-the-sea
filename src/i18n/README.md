# Internationalization (i18n) System

This project uses Astro's built-in i18n features with custom utilities for English and Italian support.

## Structure

```
src/i18n/
├── index.ts        # Barrel exports
├── translations.ts # Translation keys and content
├── utils.ts        # Language detection and utilities
├── react.tsx       # React Context Provider for TSX components
└── README.md       # This file
```

## How It Works

### 1. Configuration

- **Astro config**: `astro.config.mjs` defines `defaultLocale: 'en'`, `locales: ['en', 'it']`
- **Middleware**: `src/middleware.ts` detects language from URL and sets `Astro.locals.lang`
- **Routing**: English uses `/`, Italian uses `/it/` prefix

### 2. Page Structure

- **Shared components**: `src/components/pages/HomePage.astro` (single source of truth)
- **Language pages**:
  - `src/pages/index.astro` → `<HomePage lang={getLangFromUrl(Astro.url)} />`
  - `src/pages/it/index.astro` → `<HomePage lang="it" />`

### 3. Translation Usage

**In Astro components**:

```astro
---
import { getLangFromUrl, useTranslations } from '@/i18n';
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
---

<h1>{t('site.title')}</h1>
```

**In React components** (requires Context Provider):

```tsx
// Wrap with provider
<I18nProvider lang={lang}>
  <MyComponent />
</I18nProvider>;

// Use in component
import { useI18n } from '@/i18n/react';
const { t, lang } = useI18n();
return <h1>{t('site.title')}</h1>;
```

### 4. Key Files

- **`translations.ts`**: Contains all translation keys for both languages
- **`utils.ts`**: `getLangFromUrl()`, `useTranslations()`, `getLocalizedPath()`
- **`react.tsx`**: Context Provider pattern for React components

## Adding New Translations

1. Add key to both `en` and `it` sections in `translations.ts`
2. Use `t('your.new.key')` in components
3. TypeScript will ensure key exists and provide autocomplete
