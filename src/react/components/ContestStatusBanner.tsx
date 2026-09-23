import { ClockIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/react';
import type { TranslationKey } from '../../i18n/translations';
import { Card } from './ui/Card';

type ContestState = 'assessment' | 'closed';

type StatusPresentation = {
  variant: 'warning';
  Icon: typeof ClockIcon;
  titleKey: TranslationKey;
  messageKey: TranslationKey;
};

const PRESENTATION: Record<ContestState, StatusPresentation> = {
  assessment: {
    variant: 'warning',
    Icon: ClockIcon,
    titleKey: 'status.assessment.title',
    messageKey: 'status.assessment.message',
  },
  closed: {
    variant: 'warning',
    Icon: LockClosedIcon,
    titleKey: 'status.closed.title',
    messageKey: 'submissions.closed',
  },
};

type ContestStatusBannerProps = {
  contestStatus: 'active' | 'inactive' | 'assessment';
  hasPaid: boolean;
};

// At most one banner: why uploading is closed, or that the entry is locked in
export function ContestStatusBanner({
  contestStatus,
  hasPaid,
}: ContestStatusBannerProps) {
  const { t } = useI18n();

  // Paid entries are announced by the status line and the success banner
  const state: ContestState | null = hasPaid
    ? null
    : contestStatus === 'assessment'
      ? 'assessment'
      : contestStatus === 'inactive'
        ? 'closed'
        : null;

  if (!state) return null;

  const { variant, Icon, titleKey, messageKey } = PRESENTATION[state];

  return (
    <Card variant={variant} className="flex items-start gap-3 p-5">
      <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-editorial uppercase tracking-editorial text-foreground">
          {t(titleKey)}
        </p>
        <p className="font-light text-sm text-muted-foreground leading-paragraph">
          {t(messageKey)}
        </p>
      </div>
    </Card>
  );
}
