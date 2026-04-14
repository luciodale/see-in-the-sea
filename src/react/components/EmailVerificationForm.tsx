import { useState } from 'react';
import { useI18n } from '../../i18n/react';
import { AuthFormHeader } from './ui/AuthFormHeader';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Panel } from './ui/Panel';

interface EmailVerificationFormProps {
  onSubmit: (code: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export function EmailVerificationForm({
  onSubmit,
  onBack,
  loading,
  error,
}: EmailVerificationFormProps) {
  const { t } = useI18n();
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(code);
  };

  return (
    <Panel>
      <AuthFormHeader
        onBack={onBack}
        backDisabled={loading}
        title={t('auth.verify.title')}
        subtitle={t('auth.verify.subtitle')}
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
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        }
      />

      <Card variant="info" className="p-3 mb-6 text-sm rounded-xl">
        {t('auth.verify.instructions')}
      </Card>

      {error && (
        <Card variant="danger" className="p-3 mb-6 text-sm rounded-xl">
          {error === 'VERIFICATION_FAILED' ? t('auth.verify.failed') : error}
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="code"
          type="text"
          label={t('auth.verify.code')}
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder={t('auth.verify.code-placeholder')}
          required
          maxLength={6}
          disabled={loading}
          className="text-center text-2xl font-mono tracking-wider"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={code.length < 4}
        >
          {loading ? t('auth.verify.submitting') : t('auth.verify.submit')}
        </Button>
      </form>
    </Panel>
  );
}
