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
      <span className="text-xs text-slate-500">{t('countdown.closed')}</span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs tabular-nums',
        isUrgent ? 'text-amber-400' : 'text-slate-500'
      )}
    >
      <span>{t('countdown.closing-in')}</span>
      <span className="font-medium">
        {days}d {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
      </span>
    </span>
  );
}
