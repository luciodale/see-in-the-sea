'use client';

import { BottomBlurryOverlay } from './BottomBlurryOverlay';
import { ImageBackground } from './ImageBackground';
import { NavbarContent } from './NavbarContent';
import { NavbarHeader } from './NavbarHeader';
import { PlainOverlay } from './PlainOverlay';
import { TopBlurryOverlay } from './TopBlurryOverlay';

export function Navbar() {
  return (
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
  );
}
