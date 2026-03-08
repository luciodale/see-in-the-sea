import { Check, Minus, Plus, RotateCcw, Send } from 'lucide-react';
import { CURRENT_CONTEST_CATEGORIES } from '../../../constants/categories';
import type {
  FilterStatus,
  JudgingSubmission,
  SyncStatus,
} from '../../types/judging';
import { PLACEMENTS } from '../../types/judging';

type JudgingCategoryTabsProps = {
  activeCategory: string;
  filterStatus: FilterStatus;
  submissions: JudgingSubmission[];
  counts: {
    total: number;
    shortlisted: number;
    rejected: number;
    pending: number;
    winners: number;
  };
  placementCounts: Record<string, number>;
  sortedCount: number;
  columns: number;
  syncStatus: SyncStatus;
  onColumnsChange: (columns: number) => void;
  onCategoryChange: (categoryId: string) => void;
  onFilterChange: (status: FilterStatus) => void;
  onResetJudging: () => void;
  onSubmitResults: () => void;
};

export function JudgingCategoryTabs({
  activeCategory,
  filterStatus,
  submissions,
  counts,
  placementCounts,
  sortedCount,
  columns,
  syncStatus,
  onColumnsChange,
  onCategoryChange,
  onFilterChange,
  onResetJudging,
  onSubmitResults,
}: JudgingCategoryTabsProps) {
  return (
    <>
      {/* Row 1: Categories + Sync/Actions */}
      <div className="px-4 py-1.5 bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {CURRENT_CONTEST_CATEGORIES.map(cat => {
              const catCount = submissions.filter(
                s => s.categoryId === cat.id
              ).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat.name}
                  {catCount > 0 && (
                    <span className="ml-1.5 text-xs opacity-70">
                      {catCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {syncStatus === 'syncing' && (
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                Salvataggio...
              </span>
            )}
            {syncStatus === 'synced' && (
              <span className="text-emerald-400 text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Salvato
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="text-red-400 text-xs">Sync fallita</span>
            )}

            <button
              type="button"
              onClick={onResetJudging}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs flex items-center gap-1.5 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Azzera
            </button>
            <button
              type="button"
              onClick={onSubmitResults}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs flex items-center gap-1.5 text-white transition-colors"
            >
              <Send className="w-3 h-3" />
              Invia
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Filters + Stats + Resizer */}
      <div className="px-4 py-1.5 bg-slate-900/70 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex gap-1 flex-wrap">
            {(
              [
                { value: 'all', label: 'Tutti', count: counts.total },
                {
                  value: 'pending',
                  label: '\u25CB In attesa',
                  count: counts.pending,
                },
                {
                  value: 'shortlisted',
                  label: '\u2713 Selezionati',
                  count: counts.shortlisted,
                },
                {
                  value: 'rejected',
                  label: '\u2717 Scartati',
                  count: counts.rejected,
                },
                {
                  value: 'winners',
                  label: '\uD83C\uDFC6 Vincitori',
                  count: counts.winners,
                },
              ] as const
            ).map(filter => (
              <button
                key={filter.value}
                type="button"
                onClick={() => onFilterChange(filter.value)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  filterStatus === filter.value
                    ? filter.value === 'winners'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto text-xs shrink-0">
            <span className="text-slate-500">
              <span className="text-slate-300">{sortedCount}</span> foto
            </span>

            <div className="flex gap-2 border-l border-slate-700 pl-3">
              {PLACEMENTS.map(p => (
                <span key={p.value} className="flex items-center gap-0.5">
                  <span
                    className={`w-4 h-4 rounded ${p.color} flex items-center justify-center text-[10px] font-bold`}
                  >
                    {p.label}
                  </span>
                  <span className="text-slate-300">
                    {placementCounts[p.value!] || 0}
                  </span>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
              <button
                type="button"
                onClick={() => onColumnsChange(columns + 1)}
                disabled={columns >= 8}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-400 transition-colors"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <input
                type="range"
                min={1}
                max={8}
                value={9 - columns}
                onChange={e => onColumnsChange(9 - Number(e.target.value))}
                className="w-16 accent-emerald-500"
              />
              <button
                type="button"
                onClick={() => onColumnsChange(columns - 1)}
                disabled={columns <= 1}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-400 transition-colors"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
