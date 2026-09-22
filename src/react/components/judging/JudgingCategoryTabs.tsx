import { Check, Minus, Plus, RotateCcw, Send } from 'lucide-react';
import { CURRENT_CONTEST_CATEGORIES } from '../../../constants/categories';
import type {
  FilterStatus,
  JudgingSubmission,
  SyncStatus,
} from '../../types/judging';
import { PLACEMENTS } from '../../types/judging';
import { Button } from '../ui/Button';
import { cn } from '../ui/cn';

type JudgingCounts = {
  total: number;
  shortlisted: number;
  rejected: number;
  pending: number;
  winners: number;
};

type FilterOption = {
  value: FilterStatus;
  label: string;
  countKey: keyof JudgingCounts;
};

const FILTER_OPTIONS: readonly FilterOption[] = [
  { value: 'all', label: 'Tutti', countKey: 'total' },
  { value: 'pending', label: 'In attesa', countKey: 'pending' },
  { value: 'shortlisted', label: 'Selezionati', countKey: 'shortlisted' },
  { value: 'rejected', label: 'Scartati', countKey: 'rejected' },
  { value: 'winners', label: 'Vincitori', countKey: 'winners' },
];

const MIN_COLUMNS = 1;
const MAX_COLUMNS = 8;

const resizerButtonClass =
  'flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors cursor-pointer hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30';

type JudgingCategoryTabsProps = {
  activeCategory: string;
  filterStatus: FilterStatus;
  submissions: JudgingSubmission[];
  counts: JudgingCounts;
  placementCounts: Record<string, number>;
  sortedCount: number;
  columns: number;
  isResizable: boolean;
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
  isResizable,
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
      <div className="sticky top-0 z-10 border-b border-border px-4 py-2 bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {CURRENT_CONTEST_CATEGORIES.map(cat => {
              const catCount = submissions.filter(
                s => s.categoryId === cat.id
              ).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 text-sm rounded-full transition-colors cursor-pointer',
                    activeCategory === cat.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                  )}
                >
                  {cat.name}
                  {catCount > 0 && (
                    <span className="text-xs tabular-nums opacity-60">
                      {catCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {syncStatus === 'syncing' && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-warning animate-pulse" />
                Salvataggio...
              </span>
            )}
            {syncStatus === 'synced' && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="size-3.5 text-success" />
                Salvato
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="text-xs text-destructive">Sync fallita</span>
            )}

            <Button variant="ghost" size="sm" onClick={onResetJudging}>
              <RotateCcw className="size-3" />
              Azzera
            </Button>
            <Button variant="primary" size="sm" onClick={onSubmitResults}>
              <Send className="size-3" />
              Invia
            </Button>
          </div>
        </div>
      </div>

      {/* Row 2: Filters + Stats + Resizer */}
      <div className="border-b border-border px-4 py-2">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-1">
            {FILTER_OPTIONS.map(filter => (
              <button
                key={filter.value}
                type="button"
                onClick={() => onFilterChange(filter.value)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer',
                  filterStatus === filter.value
                    ? 'bg-surface-raised text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {filter.label}
                <span className="tabular-nums text-subtle-foreground">
                  {counts[filter.countKey]}
                </span>
              </button>
            ))}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3 text-xs">
            <span className="text-subtle-foreground">
              <span className="tabular-nums text-foreground">
                {sortedCount}
              </span>{' '}
              foto
            </span>

            <div className="flex items-center gap-2 border-l border-border pl-3">
              {PLACEMENTS.map(p => (
                <span key={p.value} className="flex items-center gap-1">
                  <span
                    className={cn(
                      'flex size-4 items-center justify-center text-tiny font-semibold rounded',
                      p.color
                    )}
                  >
                    {p.label}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {(p.value ? placementCounts[p.value] : 0) || 0}
                  </span>
                </span>
              ))}
            </div>

            {isResizable && (
              <div className="flex items-center gap-1.5 border-l border-border pl-3">
                <button
                  type="button"
                  aria-label="Anteprime più piccole"
                  onClick={() => onColumnsChange(columns + 1)}
                  disabled={columns >= MAX_COLUMNS}
                  className={resizerButtonClass}
                >
                  <Minus className="size-3" />
                </button>
                <input
                  type="range"
                  aria-label="Dimensione anteprime"
                  min={MIN_COLUMNS}
                  max={MAX_COLUMNS}
                  value={MAX_COLUMNS + 1 - columns}
                  onChange={e =>
                    onColumnsChange(MAX_COLUMNS + 1 - Number(e.target.value))
                  }
                  className="w-16 accent-foreground"
                />
                <button
                  type="button"
                  aria-label="Anteprime più grandi"
                  onClick={() => onColumnsChange(columns - 1)}
                  disabled={columns <= MIN_COLUMNS}
                  className={resizerButtonClass}
                >
                  <Plus className="size-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
