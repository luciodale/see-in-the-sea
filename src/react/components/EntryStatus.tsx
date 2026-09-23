import { useI18n } from '../../i18n/react';
import type { TranslationKey } from '../../i18n/translations';
import { useCheckout } from '../hooks/useCheckout';
import type { EntryNextAction } from '../hooks/useEntryStatus';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Eyebrow } from './ui/Eyebrow';

const GUIDANCE_KEYS: Record<EntryNextAction, TranslationKey> = {
  upload: 'entry.next.empty',
  pay: 'entry.next.pay',
  locked: 'entry.next.locked',
  closed: 'submissions.closed',
};

type EntryStatusProps = {
  uploaded: number;
  hasFreeSlot: boolean;
  categoriesEntered: number;
  nextAction: EntryNextAction;
  onUploadClick: () => void;
};

// The one widget that answers "where am I" and "what now". It never implies
// a quota: a single photo in a single category is a complete entry.
export function EntryStatus({
  uploaded,
  hasFreeSlot,
  categoriesEntered,
  nextAction,
  onUploadClick,
}: EntryStatusProps) {
  const { t } = useI18n();
  const { startCheckout, isRedirecting, error } = useCheckout();
  // Entrants with photos can still add more, so say that rather than only
  // pushing them to pay. The closed state is explained by the banner below.
  const guidance =
    nextAction === 'pay' && hasFreeSlot
      ? t('entry.next.drafting')
      : nextAction === 'closed'
        ? null
        : t(GUIDANCE_KEYS[nextAction]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <Eyebrow>{t('entry.title')}</Eyebrow>

        {uploaded > 0 ? (
          <p className="flex flex-wrap items-baseline gap-x-2 font-serif text-2xl text-foreground leading-heading">
            <span className="tabular-nums">{uploaded}</span>
            <span className="text-editorial uppercase tracking-editorial text-muted-foreground">
              {t(
                uploaded === 1 ? 'entry.summary.photo' : 'entry.summary.photos'
              )}
            </span>
            <span className="text-editorial uppercase tracking-editorial text-subtle-foreground">
              {t('entry.summary.in')}
            </span>
            <span className="tabular-nums">{categoriesEntered}</span>
            <span className="text-editorial uppercase tracking-editorial text-muted-foreground">
              {t(
                categoriesEntered === 1
                  ? 'entry.summary.category'
                  : 'entry.summary.categories'
              )}
            </span>
          </p>
        ) : (
          <p className="font-serif text-2xl text-foreground leading-heading">
            {t('submissions.no-pictures-uploaded')}
          </p>
        )}

        {guidance && (
          <p className="max-w-prose-narrow font-light text-sm text-muted-foreground leading-paragraph">
            {guidance}
          </p>
        )}
      </div>

      {nextAction === 'upload' && (
        <Button
          variant="primary"
          onClick={onUploadClick}
          className="min-h-11 w-full justify-center sm:w-auto sm:whitespace-nowrap"
        >
          {t('entry.action.upload')}
        </Button>
      )}
      {nextAction === 'pay' && (
        <Button
          variant="primary"
          onClick={startCheckout}
          loading={isRedirecting}
          className="min-h-11 w-full justify-center sm:w-auto sm:whitespace-nowrap"
        >
          {t('entry.action.pay')}
        </Button>
      )}
      {error && (
        <Card variant="danger" className="p-3 text-sm text-destructive">
          {error}
        </Card>
      )}

      {nextAction === 'locked' && (
        <Badge variant="success" className="self-start px-3 py-1">
          {t('entry.action.locked')}
        </Badge>
      )}
    </div>
  );
}
