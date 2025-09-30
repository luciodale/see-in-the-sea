import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useI18n } from '../../i18n/react';
import { getLanguageAwareRedirectUrl } from '../../i18n/utils';

type RedirectToSignInProps = {
  redirectUrl?: string;
};

export function RedirectToSignIn({ redirectUrl }: RedirectToSignInProps) {
  const { lang } = useI18n();
  const navigate = useNavigate();

  // Generate language-aware redirect URL to /user/login
  const loginUrl = getLanguageAwareRedirectUrl('/user/login', lang);

  // If a custom redirectUrl is provided, use it; otherwise use the login URL
  const finalRedirectUrl = redirectUrl || loginUrl;

  useEffect(() => {
    // Use React Router navigation instead of window.location
    navigate({ to: finalRedirectUrl });
  }, [finalRedirectUrl, navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-white">Redirecting to login...</p>
      </div>
    </div>
  );
}
