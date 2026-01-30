import { useAuth } from '@clerk/clerk-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WinnersPreviewRow, WinnersPreviewResponse } from '../../types/api';
import { getImageUrl } from '../utils/imageUtils';

type AllWinnersViewerProps = {
  contestId: string;
};

const PLACEMENT_ORDER: WinnersPreviewRow['placement'][] = [
  'first',
  'second',
  'third',
  'runner-up',
];

const PLACEMENT_STYLE: Record<
  WinnersPreviewRow['placement'],
  { label: string; color: string }
> = {
  first: { label: '1°', color: 'bg-yellow-500' },
  second: { label: '2°', color: 'bg-gray-400' },
  third: { label: '3°', color: 'bg-amber-600' },
  'runner-up': { label: 'M', color: 'bg-blue-500' },
};

function formatName(row: WinnersPreviewRow): string {
  const parts = [row.firstName, row.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : row.userEmail;
}

export function AllWinnersViewer({ contestId }: AllWinnersViewerProps) {
  const { getToken } = useAuth();
  const [rows, setRows] = useState<WinnersPreviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWinners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(
        `/api/admin/winners-preview?contestId=${encodeURIComponent(contestId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data: WinnersPreviewResponse = await res.json();
      if (data.success && data.data) {
        setRows(data.data);
      } else {
        setError(data.message ?? 'Errore caricamento');
      }
    } catch {
      setError('Errore di rete');
    } finally {
      setLoading(false);
    }
  }, [contestId, getToken]);

  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  const byCategory = useMemo(() => {
    const map = new Map<string, WinnersPreviewRow[]>();
    for (const row of rows) {
      const list = map.get(row.categoryId) ?? [];
      list.push(row);
      map.set(row.categoryId, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          PLACEMENT_ORDER.indexOf(a.placement) -
          PLACEMENT_ORDER.indexOf(b.placement)
      );
    }
    return map;
  }, [rows]);

  const categoryOrder = useMemo(() => {
    const ids = [...new Set(rows.map(r => r.categoryId))];
    const byName = new Map(rows.map(r => [r.categoryId, r.categoryName]));
    ids.sort((a, b) => (byName.get(a) ?? '').localeCompare(byName.get(b) ?? ''));
    return ids;
  }, [rows]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-center text-red-200">
        {error}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Nessun piazzamento in giuria</p>
        <p className="text-sm mt-2">
          Assegna 1°, 2°, 3° o M nel pannello Judging per vedere i vincitori qui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categoryOrder.map(categoryId => {
        const categoryRows = byCategory.get(categoryId) ?? [];
        const categoryName = categoryRows[0]?.categoryName ?? categoryId;
        return (
          <section key={categoryId}>
            <h2 className="text-xl font-medium text-slate-200 mb-4 border-b border-slate-700 pb-2">
              {categoryName}
            </h2>
            <div className="space-y-6">
              {PLACEMENT_ORDER.map(placement => {
                const placementRows = categoryRows.filter(
                  r => r.placement === placement
                );
                if (placementRows.length === 0) return null;
                const style = PLACEMENT_STYLE[placement];
                return (
                  <div key={placement}>
                    <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                      <span
                        className={`${style.color} w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold`}
                      >
                        {style.label}
                      </span>
                      {placement === 'first' && '1° Posto'}
                      {placement === 'second' && '2° Posto'}
                      {placement === 'third' && '3° Posto'}
                      {placement === 'runner-up' &&
                        `Menzioni (${placementRows.length})`}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {placementRows.map(row => (
                        <div
                          key={row.submissionId}
                          className="rounded-lg overflow-hidden bg-slate-900 border border-slate-800"
                        >
                          <div className="aspect-[4/3] bg-slate-800 relative">
                            {row.r2ImageId ? (
                              <img
                                src={getImageUrl(row.r2ImageId)}
                                alt={row.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                🖼️
                              </div>
                            )}
                            <span
                              className={`absolute top-2 left-2 ${style.color} w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg`}
                            >
                              {style.label}
                            </span>
                          </div>
                          <div className="p-3 space-y-1">
                            <p className="text-slate-200 font-medium truncate">
                              {row.title}
                            </p>
                            <p className="text-sm text-slate-300">
                              {formatName(row)}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {row.userEmail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
