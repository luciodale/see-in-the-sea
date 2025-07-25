interface OptimizedImageProps {
  r2Key: string;
  alt?: string;
  className?: string;
}

export function OptimizedImage({ r2Key, alt = "Image", className }: OptimizedImageProps) {
  const imageUrl = `/api/images/${r2Key}`;
  
  return (
    <img 
      src={imageUrl} 
      alt={alt}
      className={className}
      loading="lazy"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
} 