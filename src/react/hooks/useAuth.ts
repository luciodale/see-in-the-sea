import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { useState } from 'react';

export type AuthMode =
  | 'login'
  | 'signup'
  | 'choice'
  | 'verify-email'
  | 'reset-password'
  | 'reset-verify';

export interface UseAuthProps {
  onSuccess?: () => void;
}

export function useAuth({ onSuccess }: UseAuthProps = {}) {
  const {
    signIn,
    setActive: setActiveSignIn,
    isLoaded: signInLoaded,
  } = useSignIn();
  const {
    signUp,
    setActive: setActiveSignUp,
    isLoaded: signUpLoaded,
  } = useSignUp();

  const [mode, setMode] = useState<AuthMode>('choice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const isLoaded = signInLoaded && signUpLoaded;

  const resetState = () => {
    setError(null);
    setLoading(false);
    setResetSuccess(false);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    resetState();
  };

  const handleSignIn = async (email: string, password: string) => {
    if (!signIn || !setActiveSignIn) return;

    setError(null);
    setLoading(true);

    try {
      const attempt = await signIn.create({
        identifier: email,
        password,
      });

      if (attempt.status === 'complete') {
        await setActiveSignIn({ session: attempt.createdSessionId });
        // Scroll to top to show the user the successful state change
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onSuccess?.();
      } else {
        setError(
          'Additional verification steps required (email verification, MFA, etc.)'
        );
      }
    } catch (err) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    if (!signUp || !setActiveSignUp) return;

    setError(null);
    setLoading(true);

    try {
      const attempt = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      if (attempt.status === 'complete') {
        await setActiveSignUp({ session: attempt.createdSessionId });
        // Scroll to top to show the user the successful state change
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onSuccess?.();
      } else if (attempt.status === 'missing_requirements') {
        // Handle email verification requirement
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });

        // Switch to verification mode
        setMode('verify-email');
      } else {
        setError('REGISTRATION_INCOMPLETE');
      }
    } catch (err) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = async (code: string) => {
    if (!signUp || !setActiveSignUp) return;

    setError(null);
    setLoading(true);

    try {
      const attempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (attempt.status === 'complete') {
        await setActiveSignUp({ session: attempt.createdSessionId });
        // Scroll to top to show the user the successful state change
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onSuccess?.();
      } else {
        setError('VERIFICATION_FAILED');
      }
    } catch (err) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!signIn) return;

    setError(null);
    setLoading(true);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setResetSuccess(true);
      // Switch to verification mode
      setMode('reset-verify');
    } catch (err) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || 'Reset password failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordVerify = async (code: string, password: string) => {
    if (!signIn || !setActiveSignIn) return;

    setError(null);
    setLoading(true);

    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (attempt.status === 'complete') {
        await setActiveSignIn({ session: attempt.createdSessionId });
        // Scroll to top to show the user the successful state change
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onSuccess?.();
      } else {
        setError('Password reset verification failed');
      }
    } catch (err) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    loading,
    error,
    isLoaded,
    resetSuccess,
    setMode: handleModeChange,
    signIn: handleSignIn,
    signUp: handleSignUp,
    verifyEmail: handleEmailVerification,
    resetPassword: handleResetPassword,
    resetPasswordVerify: handleResetPasswordVerify,
    resetState,
  };
}
