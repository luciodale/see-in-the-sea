import { ClerkProvider } from '@clerk/clerk-react';
import { REDIRECT_URL } from '../../constants';
import { NavbarHeader } from './NavbarHeader';

export function NavbarHeaderWithClerk({
  clerkPublicKey,
  standalone = false,
}: {
  clerkPublicKey: string;
  standalone?: boolean;
}) {
  return (
    <ClerkProvider
      publishableKey={clerkPublicKey}
      afterSignOutUrl="/"
      signInForceRedirectUrl={REDIRECT_URL}
      signUpForceRedirectUrl={REDIRECT_URL}
    >
      <NavbarHeader standalone={standalone} />
    </ClerkProvider>
  );
}
