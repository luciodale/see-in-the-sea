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

  const loginUrl = getLanguageAwareRedirectUrl('/user/login', lang);
  const finalRedirectUrl = redirectUrl || loginUrl;

  useEffect(() => {
    navigate({ to: finalRedirectUrl });
  }, [finalRedirectUrl, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/70 mx-auto" />
        <p className="text-editorial uppercase tracking-editorial text-muted-foreground">
          Redirecting to login…
        </p>
      </div>
    </div>
  );
}
