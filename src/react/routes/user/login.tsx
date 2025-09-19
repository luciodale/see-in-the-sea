import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { getLanguageAwareRedirectUrl } from '../../../i18n/utils';

export const Route = createFileRoute('/user/login')({
  component: Login,
});

function Login() {
  // Get current language and generate language-aware redirect URL
  const lang = document.documentElement.lang as 'en' | 'it';
  const submissionsUrl = getLanguageAwareRedirectUrl('/user/submissions', lang);

  return (
    <div>
      <SignedIn>
        <Navigate to={submissionsUrl} />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}
