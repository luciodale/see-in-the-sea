import { useState } from 'react';
import { useI18n } from '../../i18n/react';
import { AuthFormHeader } from './ui/AuthFormHeader';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Panel } from './ui/Panel';

interface ResetPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
  success?: boolean;
}

export function ResetPasswordForm({
  onSubmit,
  onBack,
  loading,
  error,
  success = false,
}: ResetPasswordFormProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email);
  };

  return (
    <Panel>
      <AuthFormHeader
        onBack={onBack}
        backDisabled={loading}
        title={t('auth.reset.title')}
        subtitle={t('auth.reset.subtitle')}
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
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        }
      />

      {success && (
        <Card variant="success" className="p-3 mb-6 text-sm rounded-xl">
          {t('auth.reset.code-sent')}
        </Card>
      )}

      {error && (
        <Card variant="danger" className="p-3 mb-6 text-sm rounded-xl">
          {error}
        </Card>
      )}

      <Card className="p-4 mb-6 rounded-xl">
        <p className="text-muted-foreground text-sm">
          {t('auth.reset.instructions')}
        </p>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="reset-email"
          type="email"
          label={t('auth.reset.email')}
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('auth.reset.email-placeholder')}
          required
          disabled={loading || success}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={success}
        >
          {loading
            ? t('auth.reset.sending')
            : success
              ? t('auth.reset.code-sent')
              : t('auth.reset.send-code')}
        </Button>
      </form>
    </Panel>
  );
}
