import { CreditCardIcon } from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { useI18n } from '../../i18n/react';
import { buttonVariants } from './ui/Button';
import { cn } from './ui/cn';

export function PayNowButton() {
  const { t } = useI18n();

  return (
    <Link
      to="/user/payment"
      className={cn(
        buttonVariants({ variant: 'primary', size: 'md' }),
        'gap-2'
      )}
    >
      <CreditCardIcon className="w-5 h-5" />
      {t('payment.pay-now')}
    </Link>
  );
}
