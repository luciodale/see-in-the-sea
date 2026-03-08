import { useCallback, useEffect, useState } from 'react';

function storageKey(categoryId: string, filterStatus: string): string {
  return `judging-resize-${categoryId}-${filterStatus}`;
}

function readColumns(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const n = Number.parseInt(raw, 10);
      if (n >= 1 && n <= 8) return n;
    }
  } catch {
    // silent
  }
  return fallback;
}

export function useImageResize(
  categoryId: string,
  filterStatus: string,
  defaultColumns: number
) {
  const key = storageKey(categoryId, filterStatus);

  const [columns, setColumnsRaw] = useState(() =>
    readColumns(key, defaultColumns)
  );

  useEffect(() => {
    setColumnsRaw(readColumns(key, defaultColumns));
  }, [key, defaultColumns]);

  const setColumns = useCallback(
    (value: number) => {
      const clamped = Math.max(1, Math.min(8, value));
      setColumnsRaw(clamped);
      try {
        localStorage.setItem(key, String(clamped));
      } catch {
        // silent
      }
    },
    [key]
  );

  return { columns, setColumns };
}
