import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useI18n } from '../../i18n/react';

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
    <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-blue-950/80 to-slate-900/90 rounded-3xl border border-white/10 p-8 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8 relative">
        <button
          type="button"
          onClick={onBack}
          className="absolute -top-2 -left-2 p-2 text-gray-300 hover:text-white transition-colors cursor-pointer hover:bg-white/10 rounded-lg"
          disabled={loading}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-white"
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
        </div>

        <h1 className="text-3xl font-light text-white mb-2 tracking-wide">
          {t('auth.verify.title')}
        </h1>
        <p className="text-gray-300">{t('auth.verify.subtitle')}</p>
      </div>

      {/* Info Message */}
      <div className="backdrop-blur-sm bg-blue-950/60 border border-blue-800/40 text-blue-300 rounded-xl p-3 mb-6 text-sm">
        {t('auth.verify.instructions')}
      </div>

      {/* Error Message */}
      {error && (
        <div className="backdrop-blur-md bg-red-950/60 border border-red-800/40 text-red-300 rounded-xl p-3 mb-6 text-sm">
          {error === 'VERIFICATION_FAILED' ? t('auth.verify.failed') : error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Verification Code Field */}
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            {t('auth.verify.code')}
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={t('auth.verify.code-placeholder')}
            required
            maxLength={6}
            disabled={loading}
            className="w-full px-4 py-3 backdrop-blur-sm bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-center text-2xl font-mono tracking-wider"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || code.length < 4}
          className="cursor-pointer w-full bg-white/10 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center border border-white/20 hover:border-white/30 disabled:border-white/10"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('auth.verify.submitting')}
            </>
          ) : (
            t('auth.verify.submit')
          )}
        </button>
      </form>
    </div>
  );
}
