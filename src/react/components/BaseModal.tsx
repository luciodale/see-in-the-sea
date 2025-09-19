import { useI18n } from '../../i18n/react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  loadingSubMessage?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  error?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  isLoading = false,
  loadingMessage,
  loadingSubMessage,
  maxWidth = '2xl',
  error = false,
}: BaseModalProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

  const defaultLoadingMessage = loadingMessage || t('state.loading');
  const defaultLoadingSubMessage = loadingSubMessage || t('modal.please-wait');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div
        className={`${
          error ? 'bg-red-700 border-red-600' : 'bg-slate-800 border-slate-700'
        } border rounded-xl w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-y-auto relative`}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-800/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-white text-lg font-medium">
                {defaultLoadingMessage}
              </p>
              {defaultLoadingSubMessage && (
                <p className="text-slate-400 text-sm mt-2">
                  {defaultLoadingSubMessage}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
              aria-label={t('action.close')}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
