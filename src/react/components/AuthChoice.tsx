import {
  ArrowLeftIcon,
  ArrowRightEndOnRectangleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/react';
import type { AuthMode } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { Panel } from './ui/Panel';

interface AuthChoiceProps {
  onModeSelect: (mode: AuthMode) => void;
}

export function AuthChoice({ onModeSelect }: AuthChoiceProps) {
  const { t } = useI18n();

  return (
    <Panel>
      <div className="text-center mb-8 relative">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="absolute -top-2 -left-2 p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-surface rounded-lg cursor-pointer"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div className="w-20 h-20 bg-accent-muted border border-border-strong rounded-full flex items-center justify-center mx-auto mb-6 text-foreground">
          <svg
            aria-hidden="true"
            className="w-10 h-10"
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
        <h1 className="font-serif text-4xl text-foreground mb-3 leading-display tracking-display">
          {t('auth.choice.title')}
        </h1>
        <p className="text-muted-foreground text-base leading-body">
          {t('auth.choice.subtitle')}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => onModeSelect('signup')}
        >
          <UserPlusIcon className="h-5 w-5" />
          {t('auth.choice.signup')}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-surface text-subtle-foreground text-xs uppercase tracking-wider">
              {t('auth.choice.existing-account')}
            </span>
          </div>
        </div>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => onModeSelect('login')}
        >
          <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
          {t('auth.choice.login')}
        </Button>
      </div>
    </Panel>
  );
}
