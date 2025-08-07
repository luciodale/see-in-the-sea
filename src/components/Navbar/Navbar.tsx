'use client';

import { I18nProvider } from '@/i18n/react';
import { BottomBlurryOverlay } from './BottomBlurryOverlay';
import { ImageBackground } from './ImageBackground';
import { NavbarContent } from './NavbarContent';
import { NavbarHeader } from './NavbarHeader';
import { PlainOverlay } from './PlainOverlay';
import { TopBlurryOverlay } from './TopBlurryOverlay';

export function Navbar({ lang = 'en' }: { lang?: 'en' | 'it' }) {
  return (
    <I18nProvider lang={lang}>
      <div className="bg-gray-900 relative">
        <NavbarHeader />

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
