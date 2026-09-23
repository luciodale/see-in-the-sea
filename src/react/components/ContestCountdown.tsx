import { useI18n } from '../../i18n/react';
import { useCountdown } from '../hooks/useCountdown';
import { cn } from './ui/cn';

type ContestCountdownProps = {
  year: number | null;
};

export function ContestCountdown({ year }: ContestCountdownProps) {
  const { t } = useI18n();
  const { days, hours, minutes, seconds, isExpired, isUrgent } =
    useCountdown(year);

  if (isExpired) {
    return (
      <span className="text-editorial uppercase tracking-editorial-wider text-subtle-foreground">
        {t('countdown.closed')}
      </span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span
      className={cn(
        'inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-border bg-surface px-3 py-1.5 sm:px-4 text-editorial uppercase tracking-editorial tabular-nums',
        isUrgent ? 'border-warning/40 text-warning' : 'text-muted-foreground'
      )}
    >
      <span className="text-subtle-foreground">
        {t('countdown.closing-in')}
      </span>
      <span className="text-foreground">
        {days}d {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
      </span>
    </span>
  );
}
