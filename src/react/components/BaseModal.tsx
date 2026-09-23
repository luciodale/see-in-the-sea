import { useI18n } from '../../i18n/react';
import { cn } from './ui/cn';

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  loadingSubMessage?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  error?: boolean;
};

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
  subtitle,
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

  const borderClass = error ? 'border-destructive/60' : 'border-border-strong';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`bg-popover ${borderClass} border rounded-2xl w-full ${maxWidthClasses[maxWidth]} max-h-full overflow-y-auto relative shadow-2xl`}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-popover/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
            <div className="text-center flex flex-col gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-foreground/70 mx-auto" />
              <p className="font-serif text-xl text-foreground leading-heading">
                {defaultLoadingMessage}
              </p>
              {defaultLoadingSubMessage && (
                <p className="text-editorial uppercase tracking-editorial text-muted-foreground">
                  {defaultLoadingSubMessage}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div
            className={cn(
              'flex justify-between gap-4 mb-6',
              subtitle ? 'items-start' : 'items-center'
            )}
          >
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-2xl text-foreground leading-heading">
                {title}
              </h2>
              {subtitle && (
                <p className="text-editorial uppercase tracking-editorial text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer"
              aria-label={t('action.close')}
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
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

          {children}
        </div>
      </div>
    </div>
  );
}
