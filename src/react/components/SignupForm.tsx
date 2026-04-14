import { useState } from 'react';
import { useI18n } from '../../i18n/react';
import { AuthFormHeader } from './ui/AuthFormHeader';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Panel } from './ui/Panel';

interface SignupFormProps {
  onSubmit: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export function SignupForm({
  onSubmit,
  onBack,
  loading,
  error,
}: SignupFormProps) {
  const { t } = useI18n();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError(t('auth.signup.passwords-no-match'));
      return;
    }

    if (password.length < 8) {
      setValidationError(t('auth.signup.password-too-short'));
      return;
    }

    await onSubmit(firstName, lastName, email, password);
  };

  const displayError =
    validationError ||
    (error === 'REGISTRATION_INCOMPLETE'
      ? t('auth.signup.registration-incomplete')
      : error);

  return (
    <Panel>
      <AuthFormHeader
        onBack={onBack}
        backDisabled={loading}
        title={t('auth.signup.title')}
        icon={
          <svg
            aria-hidden="true"
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        }
      />

      {displayError && (
        <Card variant="danger" className="p-3 mb-6 text-sm rounded-xl">
          {displayError}
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="firstName"
          type="text"
          label={t('auth.signup.first-name')}
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          placeholder={t('auth.signup.first-name-placeholder')}
          required
          disabled={loading}
        />

        <Input
          id="lastName"
          type="text"
          label={t('auth.signup.last-name')}
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          placeholder={t('auth.signup.last-name-placeholder')}
          required
          disabled={loading}
        />

        <Input
          id="email"
          type="email"
          label={t('auth.signup.email')}
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('auth.signup.email-placeholder')}
          required
          disabled={loading}
        />

        <Input
          id="password"
          type="password"
          label={t('auth.signup.password')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={t('auth.signup.password-placeholder')}
          required
          minLength={8}
          disabled={loading}
        />

        <Input
          id="confirmPassword"
          type="password"
          label={t('auth.signup.confirm-password')}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder={t('auth.signup.confirm-password-placeholder')}
          required
          minLength={8}
          disabled={loading}
        />

        <div id="clerk-captcha"></div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          {loading ? t('auth.signup.submitting') : t('auth.signup.submit')}
        </Button>
      </form>
    </Panel>
  );
}
