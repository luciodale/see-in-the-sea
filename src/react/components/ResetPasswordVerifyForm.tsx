import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useI18n } from '../../i18n/react';

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

    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError(t('auth.reset-verify.passwords-no-match'));
      return;
    }

    setPasswordError(null);
    await onSubmit(code, password);
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

        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-light text-white mb-2 tracking-wide">
          {t('auth.reset-verify.title')}
        </h1>
        <p className="text-gray-300">{t('auth.reset-verify.subtitle')}</p>
      </div>

      {/* Error Message */}
      {(error || passwordError) && (
        <div className="backdrop-blur-md bg-red-950/60 border border-red-800/40 text-red-300 rounded-xl p-3 mb-6 text-sm">
          {error || passwordError}
        </div>
      )}

      {/* Instructions */}
      <div className="backdrop-blur-sm bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 mb-6">
        <p className="text-gray-300 text-sm">
          {t('auth.reset-verify.instructions')}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Verification Code Field */}
        <div>
          <label
            htmlFor="reset-code"
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            {t('auth.reset-verify.code')}
          </label>
          <input
            id="reset-code"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={t('auth.reset-verify.code-placeholder')}
            required
            disabled={loading}
            className="w-full px-4 py-3 backdrop-blur-sm bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* New Password Field */}
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            {t('auth.reset-verify.new-password')}
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('auth.reset-verify.new-password-placeholder')}
            required
            disabled={loading}
            className="w-full px-4 py-3 backdrop-blur-sm bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirm-new-password"
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            {t('auth.reset-verify.confirm-password')}
          </label>
          <input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder={t('auth.reset-verify.confirm-password-placeholder')}
            required
            disabled={loading}
            className="w-full px-4 py-3 backdrop-blur-sm bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full bg-white/10 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center border border-white/20 hover:border-white/30 disabled:border-white/10"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('auth.reset-verify.submitting')}
            </>
          ) : (
            t('auth.reset-verify.submit')
          )}
        </button>
      </form>
    </div>
  );
}
