import { useState } from 'react';
import { useI18n } from '../../i18n/react';
import type { CheckoutResponse } from '../../types/api';

// Starts Stripe checkout straight from the page: the server picks the price
// from how many categories were entered and returns the session URL.
export function useCheckout() {
  const { t } = useI18n();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    if (isRedirecting) return;

    setIsRedirecting(true);
    setError(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data: CheckoutResponse = await response.json();

      if (!data.success || !data.url) {
        throw new Error(data.message || t('error.checkout-failed'));
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : t('error.checkout-failed')
      );
      setIsRedirecting(false);
    }
  }

  return { startCheckout, isRedirecting, error };
}
