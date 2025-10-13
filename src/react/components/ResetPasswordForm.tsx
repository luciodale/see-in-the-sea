import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useI18n } from '../../i18n/react';

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
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <button
          onClick={onBack}
          className="absolute top-8 left-8 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          disabled={loading}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {t('auth.reset.title')}
        </h1>
        <p className="text-slate-300">{t('auth.reset.subtitle')}</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-900/40 border border-emerald-800 text-emerald-200 rounded-lg p-3 mb-6 text-sm">
          {t('auth.reset.code-sent')}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/40 border border-red-800 text-red-200 rounded-lg p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-6">
        <p className="text-slate-300 text-sm">{t('auth.reset.instructions')}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label
            htmlFor="reset-email"
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            {t('auth.reset.email')}
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('auth.reset.email-placeholder')}
            required
            disabled={loading || success}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || success}
          className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('auth.reset.sending')}
            </>
          ) : success ? (
            t('auth.reset.code-sent')
          ) : (
            t('auth.reset.send-code')
          )}
        </button>
      </form>

      {/* Back Link */}
      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          disabled={loading}
          className="text-sm text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {t('auth.reset.back')}
        </button>
      </div>
    </div>
  );
}
