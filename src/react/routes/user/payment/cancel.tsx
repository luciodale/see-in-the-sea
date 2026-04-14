import { XCircleIcon } from '@heroicons/react/24/outline';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useI18n } from '../../../../i18n/react';
import { getLocalizedPath } from '../../../../i18n/utils';

export const Route = createFileRoute('/user/payment/cancel')({
  component: PaymentCancel,
});

function PaymentCancel() {
  const { t, lang } = useI18n();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-surface backdrop-blur-sm border border-border rounded-2xl p-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 border border-warning/40 flex items-center justify-center">
              <XCircleIcon className="h-8 w-8 text-warning" />
            </div>
          </div>

          <div className="mb-10 space-y-4">
            <h1 className="font-serif text-3xl text-foreground leading-display tracking-display">
              {t('payment.cancelled.title')}
            </h1>
            <p className="font-light text-sm text-muted-foreground leading-paragraph">
              {t('payment.cancelled.message')}
            </p>
            <p className="text-editorial uppercase tracking-editorial text-subtle-foreground">
              {t('payment.cancelled.try-again')}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to={getLocalizedPath('user/submissions', lang)}
              className="inline-flex items-center justify-center w-full bg-accent text-accent-foreground border border-accent hover:bg-accent-hover hover:border-accent-hover rounded-full px-6 py-2.5 text-editorial uppercase tracking-editorial transition-colors duration-200"
            >
              {t('payment.cancelled.back-to-submissions')}
            </Link>

            <Link
              to={getLocalizedPath('contest', lang)}
              className="inline-flex items-center justify-center w-full bg-transparent text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded-full px-6 py-2.5 text-editorial uppercase tracking-editorial transition-colors duration-200"
            >
              View Contest Gallery
            </Link>
          </div>

          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-editorial uppercase tracking-editorial-wider text-subtle-foreground">
              No charges applied
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
