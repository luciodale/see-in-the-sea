import { useEffect, useRef, useState } from 'react';

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
};

/**
 * LazyImage component that only loads images when they're actually visible in the viewport.
 * Uses IntersectionObserver for strict lazy loading (vs browser's generous threshold).
 */
export function LazyImage({ src, alt, className }: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = imgRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isVisible ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-contain md:object-cover rounded-lg border border-slate-700 transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      ) : null}
      {/* Placeholder shown while not visible or loading */}
      {(!isVisible || !isLoaded) && (
        <div className="absolute inset-0 bg-slate-800 rounded-lg flex items-center justify-center">
          <div className="animate-pulse w-8 h-8 rounded-full bg-slate-700" />
        </div>
      )}
    </div>
  );
}

