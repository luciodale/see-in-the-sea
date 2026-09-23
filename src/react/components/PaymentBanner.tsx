import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/react';
import type { TranslationKey } from '../../i18n/translations';
import type { UICategory } from '../../types/ui';
import { useCheckout } from '../hooks/useCheckout';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { cn } from './ui/cn';
import { Eyebrow } from './ui/Eyebrow';

type PaymentBannerProps = {
  categories: UICategory[];
  className?: string;
};

export function PaymentBanner({ categories, className }: PaymentBannerProps) {
  const { t } = useI18n();
  const { startCheckout, isRedirecting, error } = useCheckout();
  const filledCategories = categories.filter(
    category => category.submissions.length > 0
  );

  return (
    <Card className={cn('flex flex-col gap-5 p-5 sm:p-6', className)}>
      <Eyebrow>{t('payment.recap.title')}</Eyebrow>

      {filledCategories.length > 0 && (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface-raised">
          {filledCategories.map(category => (
            <li
              key={category.id}
              className="flex items-baseline justify-between gap-3 px-4 py-2.5"
            >
              <span className="text-editorial uppercase tracking-editorial text-muted-foreground">
                {t(`category.${category.id}` as unknown as TranslationKey)}
              </span>
              <span className="text-sm tabular-nums text-foreground">
                {category.submissions.length}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="max-w-prose-narrow font-light text-sm text-muted-foreground leading-paragraph">
        {t('payment.recap.body')}
      </p>

      <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex min-w-0 items-start gap-2 text-xs text-subtle-foreground leading-paragraph">
          <ExclamationTriangleIcon
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0"
          />
          {t('payment.warning.message')}
        </p>
        <Button
          variant="primary"
          onClick={startCheckout}
          loading={isRedirecting}
          className="min-h-11 w-full justify-center sm:w-auto sm:shrink-0"
        >
          {t('payment.pay-now')}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive leading-paragraph">{error}</p>
      )}
    </Card>
  );
}
