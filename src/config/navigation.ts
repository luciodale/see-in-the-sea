import { getLocalizedPath, type Language, type TranslationKey } from '@/i18n';

export interface NavItem {
  name: string;
  href: string;
  key: string;
}

export function getNavigationItems(
  lang: Language,
  t: (key: TranslationKey) => string
): NavItem[] {
  return [
    {
      name: t('nav.contests'),
      href: getLocalizedPath('contest', lang),
      key: 'contest',
    },
    {
      name: t('nav.trophy'),
      href: getLocalizedPath('trophy', lang),
      key: 'trophy',
    },
    {
      name: t('nav.rules'),
      href: getLocalizedPath('rules', lang),
      key: 'rules',
    },
    {
      name: t('nav.sponsors'),
      href: getLocalizedPath('sponsors', lang),
      key: 'sponsors',
    },
    {
      name: t('nav.about'),
      href: getLocalizedPath('about', lang),
      key: 'about',
    },
    {
      name: t('nav.contact'),
      href: getLocalizedPath('contact', lang),
      key: 'contact',
    },
  ];
}
