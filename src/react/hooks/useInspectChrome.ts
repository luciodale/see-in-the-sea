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

function isInside(node: EventTarget | null, elements: (HTMLElement | null)[]) {
  return (
    node instanceof Node && elements.some(element => element?.contains(node))
  );
}

// Read live rather than tracked through focus events: WebKit fires no blur
// when a focused control unmounts, and a control focused by a click must not
// pin the bars
function hasKeyboardFocusIn(elements: (HTMLElement | null)[]) {
  const active = document.activeElement;
  return (
    active instanceof HTMLElement &&
    active.matches(':focus-visible') &&
    isInside(active, elements)
  );
}

// Visibility of an inspect view's top and bottom bars. They appear while the
// pointer is near either edge, stay while it is over a bar (hit tested on the
// bar's final position, so moving into a bar mid slide keeps it), and stay
// while a bar control has keyboard focus. Nothing invisible covers the photo.
export function useInspectChrome() {
  const [isChromeVisible, setIsChromeVisible] = useState(false);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((event: MouseEvent<HTMLElement>) => {
    if (
      event.target instanceof Element &&
      event.target.closest(`[${CHROME_IGNORE_ATTRIBUTE}]`)
    ) {
      return;
    }

    const bars = [topBarRef.current, bottomBarRef.current];
    const { clientX, clientY } = event;
    const { top, bottom } = event.currentTarget.getBoundingClientRect();
    const isNearEdge =
      clientY - top <= EDGE_REVEAL_PX || bottom - clientY <= EDGE_REVEAL_PX;
    const isOverBar = bars.some(bar => containsPoint(bar, clientX, clientY));
    const hasBarFocus = hasKeyboardFocusIn(bars);

    setIsChromeVisible(
      wasVisible => isNearEdge || hasBarFocus || (wasVisible && isOverBar)
    );
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!hasKeyboardFocusIn([topBarRef.current, bottomBarRef.current])) {
      setIsChromeVisible(false);
    }
  }, []);

  const handleBarFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    if (event.target.matches(':focus-visible')) setIsChromeVisible(true);
  }, []);

  const handleBarBlur = useCallback((event: FocusEvent<HTMLElement>) => {
    const bars = [topBarRef.current, bottomBarRef.current];
    // Focus moving within or between the bars, or onto the zoom chip
    if (isInside(event.relatedTarget, bars)) return;
    // Pointer on a bar: this blur is the mousedown of a click there, which
    // hiding now would swallow
    if (bars.some(bar => bar?.matches(':hover'))) return;
    setIsChromeVisible(false);
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
