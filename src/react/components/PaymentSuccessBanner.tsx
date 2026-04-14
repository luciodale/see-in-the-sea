import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/react';
import { Card } from './ui/Card';

export function PaymentSuccessBanner() {
  const { t } = useI18n();

  return (
    <div className="max-w-2xl mx-auto mb-6">
      <Card variant="success" className="p-10 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/40 flex items-center justify-center">
            <CheckCircleIcon className="h-8 w-8 text-success" />
          </div>
        </div>

        <h2 className="font-serif text-3xl text-foreground mb-4 leading-display tracking-display">
          {t('payment.success.title')}
        </h2>

        <p className="font-light text-sm sm:text-base text-foreground/80 leading-paragraph mb-3">
          {t('payment.success.message')}
        </p>

        <p className="text-editorial uppercase tracking-editorial text-muted-foreground">
          {t('payment.success.next-steps')}
        </p>
      </Card>
    </div>
  );
}
