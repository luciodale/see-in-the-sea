import { useState } from 'react';
import { useI18n } from '../../i18n/react';
import { AuthFormHeader } from './ui/AuthFormHeader';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Panel } from './ui/Panel';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onBack: () => void;
  onForgotPassword: () => void;
  loading: boolean;
  error: string | null;
}

export function LoginForm({
  onSubmit,
  onBack,
  onForgotPassword,
  loading,
  error,
}: LoginFormProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <Panel>
      <AuthFormHeader
        onBack={onBack}
        backDisabled={loading}
        title={t('auth.login.title')}
        subtitle={t('auth.login.subtitle')}
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
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
        }
      />

      {error && (
        <Card variant="danger" className="p-3 mb-6 text-sm rounded-xl">
          {error}
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="email"
          type="email"
          label={t('auth.login.email')}
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('auth.login.email-placeholder')}
          required
          disabled={loading}
        />

        <Input
          id="password"
          type="password"
          label={t('auth.login.password')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={t('auth.login.password-placeholder')}
          required
          disabled={loading}
        />

        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={loading}
            className="cursor-pointer text-sm text-muted-foreground hover:text-accent-hover transition-colors disabled:opacity-50"
          >
            {t('auth.reset.forgot-password')}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          {loading ? t('auth.login.submitting') : t('auth.login.submit')}
        </Button>
      </form>
    </Panel>
  );
}
