import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/react';
import { Card } from './ui/Card';

export function PaymentSuccessBanner() {
  const { t } = useI18n();

  return (
    <div className="max-w-2xl mx-auto mb-6">
      <Card variant="success" className="p-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <CheckCircleIcon className="h-16 w-16 text-emerald-400" />
        </div>

        <h2 className="text-3xl font-bold text-emerald-400 mb-4">
          {t('payment.success.title')}
        </h2>

        <p className="text-slate-200 text-lg mb-4">
          {t('payment.success.message')}
        </p>

        <p className="text-slate-300 text-sm">
          {t('payment.success.next-steps')}
        </p>
      </Card>
    </div>
  );
}
