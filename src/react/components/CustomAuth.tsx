import { useI18n } from '../../i18n/react';
import { useAuth } from '../hooks/useAuth';
import { AuthChoice } from './AuthChoice.tsx';
import { EmailVerificationForm } from './EmailVerificationForm.tsx';
import { LoginForm } from './LoginForm.tsx';
import { ResetPasswordForm } from './ResetPasswordForm.tsx';
import { ResetPasswordVerifyForm } from './ResetPasswordVerifyForm.tsx';
import { SignupForm } from './SignupForm.tsx';

interface CustomAuthProps {
  onSuccess?: () => void;
}

export function CustomAuth({ onSuccess }: CustomAuthProps) {
  const { t } = useI18n();
  const auth = useAuth({ onSuccess });

  if (!auth.isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">{t('state.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-gray-900 px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        {auth.mode === 'choice' && <AuthChoice onModeSelect={auth.setMode} />}

        {auth.mode === 'login' && (
          <LoginForm
            onSubmit={auth.signIn}
            onBack={() => auth.setMode('choice')}
            onForgotPassword={() => auth.setMode('reset-password')}
            loading={auth.loading}
            error={auth.error}
          />
        )}

        {auth.mode === 'signup' && (
          <SignupForm
            onSubmit={auth.signUp}
            onBack={() => auth.setMode('choice')}
            loading={auth.loading}
            error={auth.error}
          />
        )}

        {auth.mode === 'verify-email' && (
          <EmailVerificationForm
            onSubmit={auth.verifyEmail}
            onBack={() => auth.setMode('signup')}
            loading={auth.loading}
            error={auth.error}
          />
        )}

        {auth.mode === 'reset-password' && (
          <ResetPasswordForm
            onSubmit={auth.resetPassword}
            onBack={() => auth.setMode('login')}
            loading={auth.loading}
            error={auth.error}
            success={auth.resetSuccess}
          />
        )}

        {auth.mode === 'reset-verify' && (
          <ResetPasswordVerifyForm
            onSubmit={auth.resetPasswordVerify}
            onBack={() => auth.setMode('reset-password')}
            loading={auth.loading}
            error={auth.error}
          />
        )}
      </div>
    </div>
  );
}
