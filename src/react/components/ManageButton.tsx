import clsx from 'clsx';
import { useI18n } from '../../i18n/react';

interface ManageButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export function ManageButton({
  onClick,
  className = '',
  disabled = false,
}: ManageButtonProps) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center px-4 py-1.5 text-editorial uppercase tracking-editorial rounded-full border backdrop-blur-md transition-colors',
        disabled
          ? 'bg-background/80 border-border text-subtle-foreground cursor-not-allowed'
          : 'bg-background/80 border-border-strong text-foreground hover:bg-background hover:border-foreground/50 cursor-pointer',
        className
      )}
    >
      {t('action.manage')}
    </button>
  );
}
