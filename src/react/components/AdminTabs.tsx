import { Link } from '@tanstack/react-router';
import type { ContestSummary } from '../../types/api';
import { ContestPicker } from './admin/ContestPicker';

type AdminTabsProps = {
  contests?: ContestSummary[];
  selectedContestId?: string | null;
  onContestChange?: (contestId: string) => void;
};

const linkClass =
  'rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground';
const activeLinkClass = 'bg-foreground/15 font-medium text-foreground';

export function AdminTabs({
  contests,
  selectedContestId,
  onContestChange,
}: AdminTabsProps) {
  const showSelector = contests && contests.length > 0 && onContestChange;
  const search = selectedContestId ? { contestId: selectedContestId } : {};

  return (
    <div className="border-b border-border px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <nav className="flex items-center gap-1 flex-wrap">
          <Link
            to="/admin/current-contest"
            search={search}
            className={linkClass}
            activeProps={{ className: activeLinkClass }}
          >
            Concorso
          </Link>
          <Link
            to="/admin/judging"
            search={search}
            className={linkClass}
            activeProps={{ className: activeLinkClass }}
          >
            Valutazione
          </Link>
          <Link
            to="/admin/winners"
            search={search}
            className={linkClass}
            activeProps={{ className: activeLinkClass }}
          >
            Vincitori
          </Link>
          <Link
            to="/admin/manual-entry"
            className={linkClass}
            activeProps={{ className: activeLinkClass }}
          >
            Inserimento
          </Link>
          <Link
            to="/admin/create-old-contest"
            className={linkClass}
            activeProps={{ className: activeLinkClass }}
          >
            Concorsi Passati
          </Link>
        </nav>

        {showSelector && (
          <ContestPicker
            contests={contests}
            selectedContestId={selectedContestId}
            onChange={onContestChange}
          />
        )}
      </div>
    </div>
  );
}
