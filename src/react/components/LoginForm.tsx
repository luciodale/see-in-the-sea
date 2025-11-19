import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useI18n } from '../../i18n/react';

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

        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
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
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-light text-white mb-2 tracking-wide">
          {t('auth.login.title')}
        </h1>
        <p className="text-gray-300">{t('auth.login.subtitle')}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="backdrop-blur-md bg-red-950/60 border border-red-800/40 text-red-300 rounded-xl p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            {t('auth.login.email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('auth.login.email-placeholder')}
            required
            disabled={loading}
            className="w-full px-4 py-3 backdrop-blur-sm bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            {t('auth.login.password')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('auth.login.password-placeholder')}
            required
            disabled={loading}
            className="w-full px-4 py-3 backdrop-blur-sm bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={loading}
            className="cursor-pointer text-sm text-gray-300 hover:text-cyan-400 transition-colors disabled:opacity-50"
          >
            {t('auth.reset.forgot-password')}
          </button>
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
              {t('auth.login.submitting')}
            </>
          ) : (
            t('auth.login.submit')
          )}
        </button>
      </form>

    </div>
  );
}
