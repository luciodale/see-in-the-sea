import { useEffect, useRef } from 'react';

// On a phone the tab strip scrolls sideways, so the selected category can sit
// off screen with nothing saying which one the panel below belongs to.
export function useScrollActiveTabIntoView(activeId: string | null) {
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!activeId) return;
    activeTabRef.current?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [activeId]);

  return activeTabRef;
}
