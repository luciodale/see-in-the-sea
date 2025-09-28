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
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white transition-colors',
        disabled
          ? 'bg-slate-600 cursor-not-allowed opacity-50'
          : 'bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer',
        className
      )}
    >
      {t('action.manage')}
    </button>
  );
}
