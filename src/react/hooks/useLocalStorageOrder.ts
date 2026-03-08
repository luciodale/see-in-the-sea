import { useCallback, useEffect, useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

export function useLocalStorageOrder<T extends { id: string }>(
  key: string,
  items: T[]
): {
  orderedItems: T[];
  handleReorder: (activeId: string, overId: string) => void;
  resetOrder: () => void;
} {
  const [orderMap, setOrderMap] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setOrderMap(JSON.parse(stored));
      }
    } catch {
      // Fail silently - fault tolerant
    }
  }, [key]);

  const orderedItems = useMemo(() => {
    if (Object.keys(orderMap).length === 0) return items;

    return [...items].sort((a, b) => {
      const orderA = orderMap[a.id] ?? Infinity;
      const orderB = orderMap[b.id] ?? Infinity;
      if (orderA === Infinity && orderB === Infinity) return 0;
      return orderA - orderB;
    });
  }, [items, orderMap]);

  const handleReorder = useCallback(
    (activeId: string, overId: string) => {
      if (activeId === overId) return;

      const oldIndex = orderedItems.findIndex(i => i.id === activeId);
      const newIndex = orderedItems.findIndex(i => i.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(orderedItems, oldIndex, newIndex);

      const newOrderMap: Record<string, number> = {};
      newOrder.forEach((item, idx) => {
        newOrderMap[item.id] = idx;
      });

      setOrderMap(newOrderMap);

      try {
        localStorage.setItem(key, JSON.stringify(newOrderMap));
      } catch {
        // Fail silently
      }
    },
    [orderedItems, key]
  );

  const resetOrder = useCallback(() => {
    setOrderMap({});
    try {
      localStorage.removeItem(key);
    } catch {
      // Fail silently
    }
  }, [key]);

  return {
    orderedItems,
    handleReorder,
    resetOrder,
  };
}
