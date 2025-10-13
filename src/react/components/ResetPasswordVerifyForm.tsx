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

        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
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

        <h1 className="text-2xl font-bold text-white mb-2">
          {t('auth.reset-verify.title')}
        </h1>
        <p className="text-slate-300">{t('auth.reset-verify.subtitle')}</p>
      </div>

      {/* Error Message */}
      {(error || passwordError) && (
        <div className="bg-red-900/40 border border-red-800 text-red-200 rounded-lg p-3 mb-6 text-sm">
          {error || passwordError}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-6">
        <p className="text-slate-300 text-sm">
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
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
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

      {/* Back Link */}
      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          disabled={loading}
          className="text-sm text-slate-400 hover:text-purple-400 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {t('auth.reset-verify.back')}
        </button>
      </div>
    </div>
  );
}
