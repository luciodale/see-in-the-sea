'use client';

import { I18nProvider } from '@/i18n/react';
import { BottomBlurryOverlay } from './BottomBlurryOverlay';
import { ImageBackground } from './ImageBackground';
import { NavbarContent } from './NavbarContent';
import { NavbarHeaderWithClerk } from './NavbarHeaderWithClerk';
import { PlainOverlay } from './PlainOverlay';
import { TopBlurryOverlay } from './TopBlurryOverlay';

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
      <div className="bg-gray-900 relative">
        <NavbarHeaderWithClerk clerkPublicKey={clerkPublicKey} />

        <div className="relative isolate overflow-hidden pt-14">
          <ImageBackground />
          <TopBlurryOverlay />
          <PlainOverlay />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <NavbarContent />
          </div>
          <BottomBlurryOverlay />
        </div>
      </div>
    </I18nProvider>
  );
}
