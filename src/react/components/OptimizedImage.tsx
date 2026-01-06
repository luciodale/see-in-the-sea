import { memo, useMemo } from 'react';
import { getImageUrl } from '../utils/imageUtils';

interface OptimizedImageProps {
  r2ImageId: string | null;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage = memo(function OptimizedImage({
  r2ImageId,
  alt,
  className,
  loading = 'lazy',
}: OptimizedImageProps) {
  const imageUrl = useMemo(() => {
    return r2ImageId ? getImageUrl(r2ImageId) : null;
  }, [r2ImageId]);

  return (
    <img
      src={imageUrl || ''}
      alt={alt}
      className={className}
      loading={loading}
    />
  );
});
