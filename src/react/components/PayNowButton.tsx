import { CreditCardIcon } from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { useI18n } from '../../i18n/react';

export function PayNowButton() {
  const { t } = useI18n();

  return (
    <Link
      to="/user/payment"
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
    >
      <CreditCardIcon className="w-5 h-5" />
      {t('payment.pay-now')}
    </Link>
  );
}
