import { useEffect, useRef, useState } from 'react';

// Simple queue to limit concurrent image loads
const imageQueue: Array<() => void> = [];
let activeLoads = 0;
const MAX_CONCURRENT = 2; // Only 2 images loading at once

function enqueueLoad(startLoad: () => void) {
  if (activeLoads < MAX_CONCURRENT) {
    activeLoads++;
    startLoad();
  } else {
    imageQueue.push(startLoad);
  }
}

function onLoadComplete() {
  activeLoads--;
  if (imageQueue.length > 0 && activeLoads < MAX_CONCURRENT) {
    const next = imageQueue.shift();
    if (next) {
      activeLoads++;
      next();
    }
  }
}

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
};

/**
 * LazyImage component that only loads images when they're actually visible in the viewport.
 * Uses IntersectionObserver for strict lazy loading + request queue to limit concurrent loads.
 */
export function LazyImage({ src, alt, className }: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to detect visibility
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
        rootMargin: '50px',
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Queue the load when visible
  useEffect(() => {
    if (isVisible && !shouldLoad) {
      enqueueLoad(() => setShouldLoad(true));
    }
  }, [isVisible, shouldLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete();
  };

  const handleError = () => {
    setHasError(true);
    onLoadComplete();
  };

  return (
    <div ref={imgRef} className={className}>
      {shouldLoad && !hasError ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-contain md:object-cover rounded-lg border border-slate-700 transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : null}
      {/* Placeholder shown while not visible, loading, or on error */}
      {(!shouldLoad || !isLoaded) && !hasError && (
        <div className="absolute inset-0 bg-slate-800 rounded-lg flex items-center justify-center">
          <div className="animate-pulse w-8 h-8 rounded-full bg-slate-700" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 bg-slate-800 rounded-lg flex items-center justify-center">
          <span className="text-slate-500 text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
}
