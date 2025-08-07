import type { Language } from '@/i18n';
import { I18nProvider } from '@/i18n/react';
import { NavbarHeader } from './NavbarHeader';

interface Props {
  lang: Language;
  standalone?: boolean;
}

export function NavbarHeaderWithI18n({ lang, standalone = false }: Props) {
  return (
    <I18nProvider lang={lang}>
      <NavbarHeader standalone={standalone} />
    </I18nProvider>
  );
}
