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
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <button
          onClick={onBack}
          className="absolute top-8 left-8 p-2 text-slate-400 hover:text-white transition-colors"
          disabled={loading}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
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

        <h1 className="text-2xl font-bold text-white mb-2">
          {t('auth.verify.title')}
        </h1>
        <p className="text-slate-300">{t('auth.verify.subtitle')}</p>
      </div>

      {/* Info Message */}
      <div className="bg-blue-900/40 border border-blue-800 text-blue-200 rounded-lg p-3 mb-6 text-sm">
        {t('auth.verify.instructions')}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/40 border border-red-800 text-red-200 rounded-lg p-3 mb-6 text-sm">
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
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center text-2xl font-mono tracking-wider"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || code.length < 4}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
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

      {/* Back Link */}
      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          disabled={loading}
          className="text-sm text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
        >
          {t('auth.verify.back')}
        </button>
      </div>
    </div>
  );
}
