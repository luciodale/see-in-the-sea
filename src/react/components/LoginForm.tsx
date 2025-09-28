import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useI18n } from '../../i18n/react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export function LoginForm({ onSubmit, onBack, loading, error }: LoginFormProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
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
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          {t('auth.login.title')}
        </h1>
        <p className="text-slate-300">
          {t('auth.login.subtitle')}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/40 border border-red-800 text-red-200 rounded-lg p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            {t('auth.login.email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.login.email-placeholder')}
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            {t('auth.login.password')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.login.password-placeholder')}
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
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

      {/* Back Link */}
      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          disabled={loading}
          className="text-sm text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
        >
          {t('auth.login.back')}
        </button>
      </div>
    </div>
  );
}
