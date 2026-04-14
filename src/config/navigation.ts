import type { Language, TranslationKey } from '@/i18n/translations';
import { getLocalizedPath } from '@/i18n/utils';

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
      name: t('nav.contact'),
      href: getLocalizedPath('contact', lang),
      key: 'contact',
    },
  ];
}
