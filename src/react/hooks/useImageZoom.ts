import { useCallback, useState } from 'react';

type ZoomState = {
  zoomLevel: number;
  zoomOrigin: { x: number; y: number };
  handleZoomClick: (e: React.MouseEvent) => void;
  resetZoom: () => void;
  setZoomLevel: (level: number) => void;
};

export function useImageZoom(): ZoomState {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setZoomOrigin({ x: 50, y: 50 });
  }, []);

  const handleZoomClick = useCallback((e: React.MouseEvent) => {
    const img = (e.currentTarget as HTMLElement).querySelector('img');
    if (img) {
      const rect = img.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomOrigin({ x, y });
    }
    setZoomLevel(z => (z >= 5 ? 1 : z + 0.5));
  }, []);

  return { zoomLevel, zoomOrigin, handleZoomClick, resetZoom, setZoomLevel };
}
