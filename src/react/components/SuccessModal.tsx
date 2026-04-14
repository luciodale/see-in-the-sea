import { useI18n } from '../../i18n/react';
import { BaseModal } from './BaseModal';
import { Button } from './ui/Button';

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'info';
};

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
          aria-hidden="true"
          className="w-12 h-12 text-success"
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
        aria-hidden="true"
        className="w-12 h-12 text-accent-hover"
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
          <p className="text-muted-foreground leading-relaxed">{message}</p>
        </div>

        {/* Action */}
        <div className="flex justify-center">
          <Button variant="primary" size="lg" onClick={onClose}>
            {t('dialog.ok')}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
