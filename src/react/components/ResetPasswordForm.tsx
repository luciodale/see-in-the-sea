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
    <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-blue-950/80 to-slate-900/90 rounded-3xl border border-white/10 p-8 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8 relative">
        <button
          onClick={onBack}
          className="absolute -top-2 -left-2 p-2 text-gray-300 hover:text-white transition-colors cursor-pointer hover:bg-white/10 rounded-lg"
          disabled={loading}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
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

        <h1 className="text-3xl font-light text-white mb-2 tracking-wide">
          {t('auth.reset.title')}
        </h1>
        <p className="text-gray-300">{t('auth.reset.subtitle')}</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="backdrop-blur-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 rounded-xl p-3 mb-6 text-sm">
          {t('auth.reset.code-sent')}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="backdrop-blur-md bg-red-950/60 border border-red-800/40 text-red-300 rounded-xl p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="backdrop-blur-sm bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 mb-6">
        <p className="text-gray-300 text-sm">{t('auth.reset.instructions')}</p>
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
            className="w-full px-4 py-3 backdrop-blur-sm bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || success}
          className="cursor-pointer w-full bg-white/10 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center border border-white/20 hover:border-white/30 disabled:border-white/10"
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
    </div>
  );
}
