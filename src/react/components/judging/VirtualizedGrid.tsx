import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';

type VirtualizedGridProps<T> = {
  items: T[];
  columns: number;
  gap: number;
  estimateRowHeight: number;
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
};

export function VirtualizedGrid<T>({
  items,
  columns,
  gap,
  estimateRowHeight,
  renderItem,
  getKey,
}: VirtualizedGridProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const r: T[][] = [];
    for (let i = 0; i < items.length; i += columns) {
      r.push(items.slice(i, i + columns));
    }
    return r;
  }, [items, columns]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => estimateRowHeight + gap,
    scrollMargin: listRef.current?.offsetTop ?? 0,
    overscan: 3,
  });

  // Re-measure all rows when columns change (card heights change with width)
  useEffect(() => {
    virtualizer.measure();
  }, [columns, virtualizer]);

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div
      ref={listRef}
      style={{
        height: virtualizer.getTotalSize(),
        position: 'relative',
        width: '100%',
      }}
    >
      {virtualRows.map(virtualRow => (
        <div
          key={virtualRow.key}
          data-index={virtualRow.index}
          ref={virtualizer.measureElement}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
            paddingBottom:
              virtualRow.index < rows.length - 1 ? `${gap}px` : undefined,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              columnGap: `${gap}px`,
            }}
          >
            {rows[virtualRow.index].map(item => (
              <div key={getKey(item)}>{renderItem(item)}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
