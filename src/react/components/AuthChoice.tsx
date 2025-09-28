import {
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
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
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
        <h1 className="text-2xl font-bold text-white mb-2">
          {t('auth.choice.title')}
        </h1>
        <p className="text-slate-300">{t('auth.choice.subtitle')}</p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Sign Up Button */}
        <button
          onClick={() => onModeSelect('signup')}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center group"
        >
          <UserPlusIcon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
          {t('auth.choice.signup')}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-slate-800 text-slate-400">
              {t('auth.choice.existing-account')}
            </span>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          onClick={() => onModeSelect('login')}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center group border border-slate-600"
        >
          <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
          {t('auth.choice.login')}
        </button>
      </div>
    </div>
  );
}
