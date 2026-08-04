import { useState, useRef, useEffect, memo } from "react";
import { cn } from "@/utils/cn";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Shared Intersection Observer for better mobile performance
let sharedObserver: IntersectionObserver | null = null;
let observerTargets = new Map<Element, () => void>();

const getSharedObserver = () => {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = observerTargets.get(entry.target);
            if (callback) {
              callback();
              sharedObserver?.unobserve(entry.target);
              observerTargets.delete(entry.target);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "50px", // Load images 50px before they enter viewport
        threshold: 0.1,
      }
    );
  }
  return sharedObserver;
};

export const LazyImage = memo<LazyImageProps>(({ 
  src, 
  alt, 
  className, 
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgZmlsbD0iaHNsKHZhcigtLWJjKSAvIDAuMykiIHJ4PSI0Ii8+PC9zdmc+",
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (shouldLoad) return;
    
    const element = imgRef.current;
    if (!element) return;

    const observer = getSharedObserver();
    const callback = () => setShouldLoad(true);
    
    observerTargets.set(element, callback);
    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
        observerTargets.delete(element);
      }
    };
  }, [shouldLoad, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return null;
  }

  return (
    <img
      ref={imgRef}
      src={shouldLoad ? src : placeholder}
      alt={alt}
      className={cn(
        className,
        !isLoaded && shouldLoad && "animate-pulse bg-base-300/50"
      )}
      crossOrigin="anonymous"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
});