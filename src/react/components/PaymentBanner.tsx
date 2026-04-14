import { CreditCardIcon } from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { useI18n } from '../../i18n/react';
import { cn } from './ui/cn';

type PaymentBannerProps = {
  className?: string;
};

export function PaymentBanner({ className }: PaymentBannerProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-2xl p-6',
        className
      )}
    >
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <CreditCardIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="font-light text-sm text-foreground/85 leading-paragraph">
            {t('payment.banner.message')}
          </p>
        </div>
        <Link
          to="/user/payment"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent border border-accent text-accent-foreground rounded-full text-editorial uppercase tracking-editorial hover:bg-accent-hover hover:border-accent-hover transition-colors duration-200 flex-shrink-0"
        >
          {t('payment.pay-now')}
        </Link>
      </div>
    </div>
  );
}
