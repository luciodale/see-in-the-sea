import type { Language } from '@/i18n';
import { I18nProvider } from '@/i18n/react';
import { NavbarHeaderWithClerk } from './NavbarHeaderWithClerk';

interface Props {
  lang: Language;
  standalone?: boolean;
  clerkPublicKey: string;
}

export function NavbarHeaderWithI18n({
  lang,
  standalone = false,
  clerkPublicKey,
}: Props) {
  return (
    <I18nProvider lang={lang}>
      <NavbarHeaderWithClerk
        clerkPublicKey={clerkPublicKey}
        standalone={standalone}
      />
    </I18nProvider>
  );
}
