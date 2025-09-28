import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { getLanguageAwareRedirectUrl } from '../../../i18n/utils';
import { CustomAuth } from '../../components/CustomAuth';

export const Route = createFileRoute('/user/login')({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  
  // Get current language and generate language-aware redirect URL
  const lang = document.documentElement.lang as 'en' | 'it';
  const submissionsUrl = getLanguageAwareRedirectUrl('/user/submissions', lang);

  const handleAuthSuccess = () => {
    navigate({ to: submissionsUrl });
  };

  return (
    <div>
      <SignedIn>
        <Navigate to={submissionsUrl} />
      </SignedIn>
      <SignedOut>
        <CustomAuth onSuccess={handleAuthSuccess} />
      </SignedOut>
    </div>
  );
}
