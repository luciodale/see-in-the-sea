import { REDIRECT_URL } from '@/constants.ts';
import { ClerkProvider } from '@clerk/clerk-react';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { I18nProvider } from '../i18n/react.tsx';
import { routeTree } from './generated.ts';

// Default router for type registration
const _router = createRouter({ routeTree });
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof _router;
  }
}

export function App({ clerkPublicKey }: { clerkPublicKey?: string }) {
  if (!clerkPublicKey) {
    throw new Error('Missing Publishable Key');
  }

  const lang = document.documentElement.lang as 'en' | 'it';
  const basepath = lang === 'it' ? '/it' : '';
  const runtimeRouter = createRouter({ routeTree, basepath });

  return (
    <StrictMode>
      <I18nProvider lang={document.documentElement.lang as 'en' | 'it'}>
        <ClerkProvider
          publishableKey={clerkPublicKey}
          afterSignOutUrl="/"
          signInForceRedirectUrl={REDIRECT_URL}
          signUpForceRedirectUrl={REDIRECT_URL}
        >
          <RouterProvider router={runtimeRouter} />
        </ClerkProvider>
      </I18nProvider>
    </StrictMode>
  );
}
