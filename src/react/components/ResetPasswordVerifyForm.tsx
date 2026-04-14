import { useState } from 'react';
import { useI18n } from '../../i18n/react';
import { AuthFormHeader } from './ui/AuthFormHeader';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Panel } from './ui/Panel';

interface ResetPasswordVerifyFormProps {
  onSubmit: (code: string, password: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export function ResetPasswordVerifyForm({
  onSubmit,
  onBack,
  loading,
  error,
}: ResetPasswordVerifyFormProps) {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError(t('auth.reset-verify.passwords-no-match'));
      return;
    }

    setPasswordError(null);
    await onSubmit(code, password);
  };

  return (
    <Panel>
      <AuthFormHeader
        onBack={onBack}
        backDisabled={loading}
        title={t('auth.reset-verify.title')}
        subtitle={t('auth.reset-verify.subtitle')}
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />

      {(error || passwordError) && (
        <Card variant="danger" className="p-3 mb-6 text-sm rounded-xl">
          {error || passwordError}
        </Card>
      )}

      <Card className="p-4 mb-6 rounded-xl">
        <p className="text-muted-foreground text-sm">
          {t('auth.reset-verify.instructions')}
        </p>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="reset-code"
          type="text"
          label={t('auth.reset-verify.code')}
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder={t('auth.reset-verify.code-placeholder')}
          required
          disabled={loading}
        />

        <Input
          id="new-password"
          type="password"
          label={t('auth.reset-verify.new-password')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={t('auth.reset-verify.new-password-placeholder')}
          required
          disabled={loading}
        />

        <Input
          id="confirm-new-password"
          type="password"
          label={t('auth.reset-verify.confirm-password')}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder={t('auth.reset-verify.confirm-password-placeholder')}
          required
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          {loading
            ? t('auth.reset-verify.submitting')
            : t('auth.reset-verify.submit')}
        </Button>
      </form>
    </Panel>
  );
}
