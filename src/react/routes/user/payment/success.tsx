import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useI18n } from '../../../../i18n/react';
import { getLocalizedPath } from '../../../../i18n/utils';

export const Route = createFileRoute('/user/payment/success')({
  component: PaymentSuccess,
});

function PaymentSuccess() {
  const { t, lang } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-8 text-center shadow-2xl">
          {/* Success Icon */}
          <div className="mb-6">
            <CheckCircleIcon className="h-20 w-20 text-emerald-400 mx-auto animate-pulse" />
          </div>

          {/* Success Message */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-3">
              {t('payment.success.title')}
            </h1>
            <p className="text-slate-300 mb-4">
              {t('payment.success.message')}
            </p>
            <p className="text-sm text-slate-400">
              {t('payment.success.next-steps')}
            </p>
          </div>

          {/* Action Button */}
          <Link
            to={getLocalizedPath('user/submissions', lang)}
            className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {t('payment.success.back-to-submissions')}
          </Link>
        </div>
      </div>
    </div>
  );
}
