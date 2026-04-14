import { I18nProvider } from '@/i18n/react';
import type { Language } from '@/i18n/translations';
import { NavbarHeaderWithClerk } from './NavbarHeaderWithClerk';

interface Props {
  lang: Language;
  darkOverlay?: boolean;
  clerkPublicKey: string;
}

export function NavbarHeaderWithI18n({
  lang,
  darkOverlay = false,
  clerkPublicKey,
}: Props) {
  return (
    <I18nProvider lang={lang}>
      <NavbarHeaderWithClerk
        clerkPublicKey={clerkPublicKey}
        darkOverlay={darkOverlay}
        lang={lang}
      />
    </I18nProvider>
  );
}
