import type { ReactNode } from 'react';
import { formatPercent } from '../../utils/adminFormat';

type StatCardProps = {
  label: string;
  value: ReactNode;
  children?: ReactNode;
};

function StatCard({ label, value, children }: StatCardProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-lg border border-border bg-surface px-3 py-2">
      <p className="truncate text-tiny font-medium uppercase tracking-editorial text-subtle-foreground">
        {label}
      </p>
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="text-lg font-medium tabular-nums text-foreground">
          {value}
        </span>
        {children}
      </div>
    </div>
  );
}

type SubmissionsStatsProps = {
  totalUsers: number;
  isLoadingUsers: boolean;
  usersWithoutUploadsCount: number;
  usersWhoSubmitted: number;
  usersWhoPaid: number;
  totalPhotoCount: number;
  onShowUsersWithoutUploads: () => void;
};

export function SubmissionsStats({
  totalUsers,
  isLoadingUsers,
  usersWithoutUploadsCount,
  usersWhoSubmitted,
  usersWhoPaid,
  totalPhotoCount,
  onShowUsersWithoutUploads,
}: SubmissionsStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <StatCard
        label="Utenti Registrati"
        value={isLoadingUsers ? '…' : totalUsers}
      >
        {!isLoadingUsers && usersWithoutUploadsCount > 0 && (
          <button
            type="button"
            onClick={onShowUsersWithoutUploads}
            className="truncate text-xs text-muted-foreground underline-offset-2 transition-colors cursor-pointer hover:text-foreground hover:underline"
          >
            {usersWithoutUploadsCount} senza foto
          </button>
        )}
      </StatCard>

      <StatCard label="Utenti con Foto" value={usersWhoSubmitted}>
        <span className="truncate text-xs text-subtle-foreground">
          {formatPercent(usersWhoSubmitted, totalUsers)} · {totalPhotoCount}{' '}
          foto
        </span>
      </StatCard>

      <StatCard label="Utenti Paganti" value={usersWhoPaid}>
        <span className="truncate text-xs text-subtle-foreground">
          {formatPercent(usersWhoPaid, usersWhoSubmitted)} con foto
        </span>
      </StatCard>
    </div>
  );
}
