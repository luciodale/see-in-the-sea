import { useCallback, useState } from 'react';

export function useExpandedRows() {
  const [expandedRows, setExpandedRows] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const toggleRow = useCallback((rowId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  const isExpanded = useCallback(
    (rowId: string) => expandedRows.has(rowId),
    [expandedRows]
  );

  return { isExpanded, toggleRow };
}
