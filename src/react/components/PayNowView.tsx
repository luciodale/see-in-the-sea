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
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-4">
        <Link
          to="/user/submissions"
          className="text-editorial uppercase tracking-editorial text-muted-foreground hover:text-foreground transition-colors inline-block cursor-pointer"
        >
          ← {t('payment.back-to-submissions')}
        </Link>
        <h1 className="font-serif text-4xl sm:text-5xl text-foreground leading-display tracking-display">
          {t('payment.title')}
        </h1>
      </div>

      <Card variant="warning">
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
          <div className="space-y-3">
            <h2 className="font-serif text-xl text-foreground leading-heading">
              {t('payment.warning.title')}
            </h2>
            <p className="font-light text-sm text-foreground/80 leading-paragraph">
              {t('payment.warning.message')}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-center space-y-5">
          <div className="flex items-center justify-center gap-3">
            <CreditCardIcon className="h-6 w-6 text-foreground/70" />
            <h3 className="font-serif text-2xl text-foreground leading-heading">
              {t('payment.pay-now')}
            </h3>
          </div>

          <p className="font-light text-sm text-muted-foreground leading-paragraph">
            {t('payment.secure-payment')}
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/40 text-destructive rounded-xl p-3 text-sm font-light">
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
                <CreditCardIcon className="h-4 w-4" />
                {t('payment.pay-now')}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
