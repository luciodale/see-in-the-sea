import { useI18n } from '../../i18n/react';

interface ManageButtonProps {
  onClick: () => void;
  className?: string;
}

export function ManageButton({ onClick, className = '' }: ManageButtonProps) {
  const { t } = useI18n();

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer ${className}`}
    >
      {t('action.manage')}
    </button>
  );
}
