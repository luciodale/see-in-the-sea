import { ClerkProvider } from '@clerk/clerk-react';
import { REDIRECT_URL } from '../../constants';
import {
  getLanguageAwareRedirectUrl,
  getLanguageAwareSignOutUrl,
} from '../../i18n/utils';
import { NavbarHeader } from './NavbarHeader';

export function NavbarHeaderWithClerk({
  clerkPublicKey,
  standalone = false,
  lang = 'en',
}: {
  clerkPublicKey: string;
  standalone?: boolean;
  lang?: 'en' | 'it';
}) {
  // Generate language-aware redirect URLs
  const signInRedirectUrl = getLanguageAwareRedirectUrl(REDIRECT_URL, lang);
  const signUpRedirectUrl = getLanguageAwareRedirectUrl(REDIRECT_URL, lang);
  const signOutRedirectUrl = getLanguageAwareSignOutUrl(lang);

  return (
    <ClerkProvider
      publishableKey={clerkPublicKey}
      afterSignOutUrl={signOutRedirectUrl}
      signInForceRedirectUrl={signInRedirectUrl}
      signUpForceRedirectUrl={signUpRedirectUrl}
    >
      <NavbarHeader standalone={standalone} />
    </ClerkProvider>
  );
}
