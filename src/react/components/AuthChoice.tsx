import {
  ArrowLeftIcon,
  ArrowRightEndOnRectangleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/react';
import type { AuthMode } from '../hooks/useAuth';

interface AuthChoiceProps {
  onModeSelect: (mode: AuthMode) => void;
}

export function AuthChoice({ onModeSelect }: AuthChoiceProps) {
  const { t } = useI18n();

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-blue-950/80 to-slate-900/90 rounded-3xl border border-white/10 p-8 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8 relative">
        <button
          onClick={() => window.history.back()}
          className="absolute -top-2 -left-2 p-2 text-gray-300 hover:text-white transition-colors hover:bg-white/10 rounded-lg cursor-pointer"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/30">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-light text-white mb-3 tracking-wide">
          {t('auth.choice.title')}
        </h1>
        <p className="text-gray-300 text-lg">{t('auth.choice.subtitle')}</p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Sign Up Button */}
        <button
          onClick={() => onModeSelect('signup')}
          className="w-full bg-white/10 hover:bg-white/15 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center group cursor-pointer border border-white/20 hover:border-white/30"
        >
          <UserPlusIcon className="h-5 w-5 mr-3" />
          {t('auth.choice.signup')}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-br from-slate-900/90 via-blue-950/80 to-slate-900/90 text-gray-400 text-xs uppercase tracking-wider">
              {t('auth.choice.existing-account')}
            </span>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          onClick={() => onModeSelect('login')}
          className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center group border border-white/10 hover:border-white/20 cursor-pointer"
        >
          <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-3" />
          {t('auth.choice.login')}
        </button>
      </div>
    </div>
  );
}
