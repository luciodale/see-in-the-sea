import type { SyntheticEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type PortfolioLayout = 'row' | 'pyramid';

type Size = {
  width: number;
  height: number;
};

// Must match the gap-1 utility between cells (0.25rem)
const CELL_GAP_PX = 4;
// Height reserved in each cell for the photo type label
const LABEL_PX = 20;
// Typical landscape ratio, used until a photo reports its real size
const FALLBACK_ASPECT = 1.5;

function fittedArea(aspect: number, cell: Size) {
  const width = Math.min(cell.width, cell.height * aspect);
  return width * (width / aspect);
}

function totalArea(aspects: number[], cell: Size) {
  return aspects.reduce((sum, aspect) => sum + fittedArea(aspect, cell), 0);
}

// Pick the layout that shows the most photo area: one row, or two on top
// and one centred below. Landscape photos gain from 2 + 1; portraits and
// squares from a single row.
export function choosePortfolioLayout(
  aspects: number[],
  container: Size
): PortfolioLayout {
  if (aspects.length !== 3 || container.width === 0) return 'row';

  const rowCell = {
    width: (container.width - CELL_GAP_PX * 2) / 3,
    height: container.height - LABEL_PX,
  };
  const pyramidCell = {
    width: (container.width - CELL_GAP_PX) / 2,
    height: (container.height - CELL_GAP_PX) / 2 - LABEL_PX,
  };

  return totalArea(aspects, pyramidCell) > totalArea(aspects, rowCell)
    ? 'pyramid'
    : 'row';
}

// Photos that have not reported their size by then are laid out with the
// fallback ratio, so a slow image never blocks the view
const SETTLE_TIMEOUT_MS = 1500;

type LayoutPhoto = {
  id: string;
  r2ImageId: string | null;
};

// Chooses the portfolio layout from the real photo ratios. The grid stays
// hidden (isReady false) until every photo has loaded or failed, so judges
// never see it jump from one layout to the other mid screen share.
export function usePortfolioLayout(photos: LayoutPhoto[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<Size>({
    width: 0,
    height: 0,
  });
  const [aspects, setAspects] = useState<Record<string, number>>({});
  const [failedIds, setFailedIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const [timedOutKey, setTimedOutKey] = useState<string | null>(null);
  // Ratios the layout was chosen from when the grid was first shown
  const [shownAspects, setShownAspects] = useState<{
    key: string;
    aspects: number[];
  } | null>(null);
  const portfolioKey = photos.map(photo => photo.id).join('|');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ width, height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(
      () => setTimedOutKey(portfolioKey),
      SETTLE_TIMEOUT_MS
    );
    return () => clearTimeout(timeout);
  }, [portfolioKey]);

  const handleImageLoad = useCallback(
    (photoId: string, event: SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = event.currentTarget;
      if (!naturalHeight) return;
      setAspects(prev => ({
        ...prev,
        [photoId]: naturalWidth / naturalHeight,
      }));
    },
    []
  );

  const handleImageError = useCallback((photoId: string) => {
    setFailedIds(prev => new Set(prev).add(photoId));
  }, []);

  const isSettled = photos.every(
    photo =>
      !photo.r2ImageId ||
      aspects[photo.id] !== undefined ||
      failedIds.has(photo.id)
  );
  const isReady =
    containerSize.width > 0 && (isSettled || timedOutKey === portfolioKey);

  const liveAspects = photos.map(photo => aspects[photo.id] ?? FALLBACK_ASPECT);
  // Once shown, a photo arriving after the timeout must not flip the layout
  if (isReady && shownAspects?.key !== portfolioKey) {
    setShownAspects({ key: portfolioKey, aspects: liveAspects });
  }

  const layout = choosePortfolioLayout(
    shownAspects?.key === portfolioKey ? shownAspects.aspects : liveAspects,
    containerSize
  );

  return {
    containerRef,
    layout,
    isReady,
    failedIds,
    handleImageLoad,
    handleImageError,
  };
}
