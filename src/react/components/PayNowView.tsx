import {
  CreditCardIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useI18n } from '../../i18n/react';
import type { CheckoutResponse } from '../../types/api';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function PayNowView() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayNow = async () => {
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
    } catch (_err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <Link
          to="/user/submissions"
          className="text-slate-400 hover:text-white transition-colors mb-4 inline-block cursor-pointer"
        >
          {t('payment.back-to-submissions')}
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('payment.title')}
        </h1>
      </div>

      {/* Warning Card */}
      <Card variant="warning">
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-amber-200">
              {t('payment.warning.title')}
            </h2>
            <p className="text-amber-100 leading-relaxed">
              {t('payment.warning.message')}
            </p>
          </div>
        </div>
      </Card>

      {/* Payment Card */}
      <Card variant="success" className="rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CreditCardIcon className="h-8 w-8 text-emerald-400 mr-3" />
            <h3 className="text-xl font-bold text-white">
              {t('payment.pay-now')}
            </h3>
          </div>

          <div className="mb-6">
            <p className="text-slate-300 text-sm">
              {t('payment.secure-payment')}
            </p>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-800 text-red-200 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handlePayNow}
            loading={loading}
          >
            {loading ? (
              t('payment.processing')
            ) : (
              <>
                <CreditCardIcon className="h-5 w-5" />
                {t('payment.pay-now')}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
