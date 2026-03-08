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
        'bg-gradient-to-r from-emerald-950/40 to-slate-800/60 border border-emerald-800/30 rounded-xl p-5',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <CreditCardIcon className="w-5 h-5 text-emerald-500/70 flex-shrink-0" />
          <p className="text-sm text-slate-300">
            {t('payment.banner.message')}
          </p>
        </div>
        <Link
          to="/user/payment"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all duration-200 flex-shrink-0"
        >
          {t('payment.pay-now')}
        </Link>
      </div>
    </div>
  );
}
