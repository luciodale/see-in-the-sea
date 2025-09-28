import { XCircleIcon } from '@heroicons/react/24/outline';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useI18n } from '../../../../i18n/react';

export const Route = createFileRoute('/user/payment/cancel')({
  component: PaymentCancel,
});

function PaymentCancel() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8 text-center shadow-2xl">
          {/* Cancel Icon */}
          <div className="mb-6">
            <XCircleIcon className="h-20 w-20 text-orange-400 mx-auto" />
          </div>

          {/* Cancel Message */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-3">
              {t('payment.cancelled.title')}
            </h1>
            <p className="text-slate-300 mb-4">
              {t('payment.cancelled.message')}
            </p>
            <p className="text-sm text-slate-400">
              {t('payment.cancelled.try-again')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/user/submissions"
              className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {t('payment.cancelled.back-to-submissions')}
            </Link>

            <Link
              to="/contest"
              className="inline-flex items-center justify-center w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              View Contest Gallery
            </Link>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              <span>No charges applied</span>
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
