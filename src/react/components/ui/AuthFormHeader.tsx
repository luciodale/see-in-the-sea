import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';

type AuthFormHeaderProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backDisabled?: boolean;
};

export function AuthFormHeader({
  icon,
  title,
  subtitle,
  onBack,
  backDisabled,
}: AuthFormHeaderProps) {
  return (
    <div className="text-center mb-8 relative">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          className="absolute -top-2 -left-2 p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:bg-surface rounded-lg disabled:opacity-50"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
      )}

      <div className="w-16 h-16 bg-accent-muted border border-border-strong rounded-full flex items-center justify-center mx-auto mb-4 text-foreground">
        {icon}
      </div>

      <h1 className="font-serif text-4xl text-foreground mb-2 leading-display tracking-display">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground text-sm leading-body">{subtitle}</p>
      )}
    </div>
  );
}
