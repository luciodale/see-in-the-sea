import { memo, useMemo } from 'react';
import { getImageUrl } from '../utils/imageUtils';

interface OptimizedImageProps {
  r2Key: string | null;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
}

export const OptimizedImage = memo(function OptimizedImage({
  r2Key,
  alt,
  className,
  loading = 'lazy',
  onClick,
}: OptimizedImageProps) {
  const imageUrl = useMemo(() => {
    return r2Key ? getImageUrl(r2Key) : null;
  }, [r2Key]);

  if (!imageUrl) {
    return (
      <div
        className={`bg-slate-700 flex items-center justify-center ${className || ''}`}
      >
        <span className="text-slate-400 text-xs">No image</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading={loading}
      onClick={onClick}
    />
  );
});
