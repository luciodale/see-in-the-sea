import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useI18n } from '../../i18n/react';

interface SignupFormProps {
  onSubmit: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export function SignupForm({
  onSubmit,
  onBack,
  loading,
  error,
}: SignupFormProps) {
  const { t } = useI18n();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate password confirmation
    if (password !== confirmPassword) {
      setValidationError(t('auth.signup.passwords-no-match'));
      return;
    }

    if (password.length < 8) {
      setValidationError(t('auth.signup.password-too-short'));
      return;
    }

    await onSubmit(firstName, lastName, email, password);
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
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-light text-white mb-2 tracking-wide">
          {t('auth.signup.title')}
        </h1>
      </div>

      {/* Error Messages */}
      {(error || validationError) && (
        <div className="backdrop-blur-md bg-red-950/60 border border-red-800/40 text-red-300 rounded-xl p-3 mb-6 text-sm">
          {validationError ||
            (error === 'REGISTRATION_INCOMPLETE'
              ? t('auth.signup.registration-incomplete')
              : error)}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            {t('auth.signup.first-name')}
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder={t('auth.signup.first-name-placeholder')}
            required
            disabled={loading}
            className="w-full px-4 py-3 backdrop-blur-sm bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            {t('auth.signup.last-name')}
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder={t('auth.signup.last-name-placeholder')}
            required
            disabled={loading}
            className="w-full px-4 py-3 backdrop-blur-sm bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            {t('auth.signup.email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('auth.signup.email-placeholder')}
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
            {t('auth.signup.password')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('auth.signup.password-placeholder')}
            required
            minLength={8}
            disabled={loading}
            className="w-full px-4 py-3 backdrop-blur-sm bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            {t('auth.signup.confirm-password')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder={t('auth.signup.confirm-password-placeholder')}
            required
            minLength={8}
            disabled={loading}
            className="w-full px-4 py-3 backdrop-blur-sm bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* CAPTCHA Container */}
        <div id="clerk-captcha"></div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full bg-white/10 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center border border-white/20 hover:border-white/30 disabled:border-white/10"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('auth.signup.submitting')}
            </>
          ) : (
            t('auth.signup.submit')
          )}
        </button>
      </form>
    </div>
  );
}
