'use client';

import { I18nProvider } from '@/i18n/react';
import { ImageBackground } from './ImageBackground';
import { NavbarContent } from './NavbarContent';
import { NavbarHeaderWithClerk } from './NavbarHeaderWithClerk';

export function Navbar({
  lang = 'en',
  clerkPublicKey,
}: {
  lang?: 'en' | 'it';
  clerkPublicKey?: string;
}) {
  if (!clerkPublicKey) {
    throw new Error('Clerk public key is required');
  }

  return (
    <I18nProvider lang={lang}>
      <div className="relative isolate overflow-hidden h-screen flex flex-col">
        <ImageBackground />
        <NavbarHeaderWithClerk
          clerkPublicKey={clerkPublicKey}
          lang={lang}
          darkOverlay
        />
        <div className="flex-1 flex mx-auto max-w-7xl w-full px-6 lg:px-8">
          <NavbarContent />
        </div>
      </div>
    </I18nProvider>
  );
}
