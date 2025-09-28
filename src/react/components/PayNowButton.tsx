import { CreditCardIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useI18n } from '../../i18n/react';
import type { CheckoutResponse } from '../../types/api';

interface PayNowButtonProps {
  hasSubmissions: boolean;
  categoryCount: number;
}

export function PayNowButton({
  hasSubmissions,
  categoryCount,
}: PayNowButtonProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPrice = () => {
    return categoryCount === 1 ? '€20' : '€30';
  };

  const getPriceDescription = () => {
    if (categoryCount === 1) {
      return t('payment.single-category');
    }
    return t('payment.multiple-categories');
  };

  const handlePayNow = async () => {
    if (!hasSubmissions) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: CheckoutResponse = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setError(data.message || 'Failed to create checkout session');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasSubmissions) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 text-center">
        <div className="text-slate-400 mb-4">
          <CreditCardIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-lg font-medium">
            {t('payment.no-submissions-title')}
          </p>
          <p className="text-sm mt-1">{t('payment.no-submissions-desc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 border border-emerald-700/50 rounded-lg p-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <CreditCardIcon className="h-8 w-8 text-emerald-400 mr-3" />
          <h3 className="text-xl font-bold text-white">{t('payment.title')}</h3>
        </div>

        <div className="mb-4">
          <div className="text-3xl font-bold text-emerald-400">
            {getPrice()}
          </div>
          <p className="text-slate-300 text-sm mt-1">{getPriceDescription()}</p>
          <p className="text-slate-400 text-xs mt-2">
            {t('payment.categories-submitted').replace(
              '{count}',
              categoryCount.toString()
            )}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-800 text-red-200 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePayNow}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('payment.processing')}
            </>
          ) : (
            <>
              <CreditCardIcon className="h-5 w-5 mr-2" />
              {t('payment.pay-now')}
            </>
          )}
        </button>

        <p className="text-xs text-slate-400 mt-3">
          {t('payment.secure-payment')}
        </p>
      </div>
    </div>
  );
}
