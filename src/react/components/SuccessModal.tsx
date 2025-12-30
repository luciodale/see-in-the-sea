import { useI18n } from '../../i18n/react';
import { BaseModal } from './BaseModal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'info';
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'success',
}: SuccessModalProps) {
  const { t } = useI18n();

  const getIcon = () => {
    if (variant === 'success') {
      return (
        <svg
          className="w-12 h-12 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-12 h-12 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-6">
        {/* Icon and Message */}
        <div className="text-center">
          <div className="flex justify-center mb-4">{getIcon()}</div>
          <p className="text-slate-300 leading-relaxed">{message}</p>
        </div>

        {/* Action */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            {t('dialog.ok')}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
