import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { IMAGES_BASE_URL } from '../../constants';
import type { JudgeLibraryItem, JudgesLibraryResponse } from '../../types/api';

interface JudgeLibraryPickerProps {
  onSelect: (item: JudgeLibraryItem) => void;
  busyR2ImageId: string | null;
  excludeR2ImageId?: string | null;
  emptyMessage?: string;
  helperText?: string;
}

export function JudgeLibraryPicker({
  onSelect,
  busyR2ImageId,
  excludeR2ImageId,
  emptyMessage = 'Nessuna foto giudice in libreria',
  helperText,
}: JudgeLibraryPickerProps) {
  const { getToken } = useAuth();
  const [library, setLibrary] = useState<JudgeLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getToken()
      .then(token =>
        fetch('/api/admin/judges-library', {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then(async response => {
        const result: JudgesLibraryResponse = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Errore caricamento libreria');
        }
        if (!cancelled) setLibrary(result.data ?? []);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Error loading judges library:', err);
        setError(err instanceof Error ? err.message : 'Errore imprevisto');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const visible = excludeR2ImageId
    ? library.filter(i => i.r2ImageId !== excludeR2ImageId)
    : library;

  return (
    <div className="space-y-3">
      {helperText && <p className="text-sm text-slate-300">{helperText}</p>}
      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-md p-3">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}
      {loading ? (
        <p className="text-sm text-slate-400 text-center py-4">
          Caricamento...
        </p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {visible.map(item => {
            const busy = busyR2ImageId === item.r2ImageId;
            return (
              <button
                key={item.r2ImageId}
                type="button"
                onClick={() => onSelect(item)}
                disabled={busyR2ImageId !== null}
                className="group flex flex-col items-center gap-2 p-3 bg-slate-700 rounded-md hover:bg-slate-600 border border-slate-600 hover:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative">
                  <img
                    src={`${IMAGES_BASE_URL}/${item.r2ImageId}`}
                    alt={item.fullName}
                    className="w-16 h-16 rounded-full object-cover border border-slate-500"
                  />
                  {busy && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-200 text-center leading-tight">
                  {item.fullName}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
