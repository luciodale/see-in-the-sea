import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/react';
import { Card } from './ui/Card';

export function PaymentSuccessBanner() {
  const { t } = useI18n();

  return (
    <Card variant="success" className="flex items-start gap-3 p-5">
      <CheckCircleIcon className="size-5 shrink-0 text-success" />
      <div className="flex flex-col gap-1 min-w-0">
        <h2 className="text-editorial uppercase tracking-editorial text-foreground">
          {t('payment.success.title')}
        </h2>
        <p className="font-light text-sm text-muted-foreground leading-paragraph">
          {t('payment.success.message')}
        </p>
      </div>
    </Card>
  );
}
