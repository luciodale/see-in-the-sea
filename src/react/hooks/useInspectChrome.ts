import type { FocusEvent, MouseEvent, RefObject } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

// Pointer distance from the top or bottom edge that reveals the bars
const EDGE_REVEAL_PX = 40;

// Marks floating controls (the zoom chip) that must never reveal the bars
export const CHROME_IGNORE_ATTRIBUTE = 'data-chrome-ignore';

export type ChromeBarProps = {
  barRef: RefObject<HTMLDivElement | null>;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
};

function containsPoint(element: HTMLElement | null, x: number, y: number) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// Visibility of an inspect view's top and bottom bars. They appear while the
// pointer is near either edge, stay while it is over a bar (hit tested on the
// bar's final position, so moving into a bar mid slide keeps it), and stay
// while a bar control has keyboard focus. Nothing invisible covers the photo.
export function useInspectChrome() {
  const [isChromeVisible, setIsChromeVisible] = useState(false);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const hasBarFocusRef = useRef(false);

  const handleMouseMove = useCallback((event: MouseEvent<HTMLElement>) => {
    if (
      event.target instanceof Element &&
      event.target.closest(`[${CHROME_IGNORE_ATTRIBUTE}]`)
    ) {
      return;
    }

    const { clientX, clientY } = event;
    const { top, bottom } = event.currentTarget.getBoundingClientRect();
    const isNearEdge =
      clientY - top <= EDGE_REVEAL_PX || bottom - clientY <= EDGE_REVEAL_PX;
    const isOverBar =
      containsPoint(topBarRef.current, clientX, clientY) ||
      containsPoint(bottomBarRef.current, clientX, clientY);

    setIsChromeVisible(
      wasVisible =>
        isNearEdge || hasBarFocusRef.current || (wasVisible && isOverBar)
    );
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!hasBarFocusRef.current) setIsChromeVisible(false);
  }, []);

  const handleBarFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    if (!event.target.matches(':focus-visible')) return;
    hasBarFocusRef.current = true;
    setIsChromeVisible(true);
  }, []);

  const handleBarBlur = useCallback((event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    const wasKeyboardFocus = hasBarFocusRef.current;
    hasBarFocusRef.current = false;
    if (wasKeyboardFocus && !event.currentTarget.matches(':hover')) {
      setIsChromeVisible(false);
    }
  }, []);

  const surfaceHandlers = useMemo(
    () => ({ onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave }),
    [handleMouseMove, handleMouseLeave]
  );

  const topBarProps = useMemo<ChromeBarProps>(
    () => ({
      barRef: topBarRef,
      onFocus: handleBarFocus,
      onBlur: handleBarBlur,
    }),
    [handleBarFocus, handleBarBlur]
  );

  const bottomBarProps = useMemo<ChromeBarProps>(
    () => ({
      barRef: bottomBarRef,
      onFocus: handleBarFocus,
      onBlur: handleBarBlur,
    }),
    [handleBarFocus, handleBarBlur]
  );

  return { isChromeVisible, surfaceHandlers, topBarProps, bottomBarProps };
}
