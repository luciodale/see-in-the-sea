import { Link } from '@tanstack/react-router';
import type { ContestSummary } from '../../types/api';

type AdminTabsProps = {
  contests?: ContestSummary[];
  selectedContestId?: string | null;
  onContestChange?: (contestId: string) => void;
};

const linkClass =
  'px-3 py-1.5 rounded text-sm text-slate-400 hover:text-white transition-colors';
const activeLinkClass = 'bg-slate-800 text-white font-medium';

export function AdminTabs({
  contests,
  selectedContestId,
  onContestChange,
}: AdminTabsProps) {
  const showSelector = contests && contests.length > 0 && onContestChange;
  const search = selectedContestId ? { contestId: selectedContestId } : {};

  return (
    <div className="px-4 py-2 border-b border-slate-800">
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
            Judging
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
          <select
            value={selectedContestId ?? ''}
            onChange={e => onContestChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 shrink-0"
          >
            {contests.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.year})
                {c.status === 'active'
                  ? ' - Attivo'
                  : c.status === 'assessment'
                    ? ' - Valutazione'
                    : ''}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
