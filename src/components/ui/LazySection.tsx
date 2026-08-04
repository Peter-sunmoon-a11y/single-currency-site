import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

interface LazySectionProps {
  children: ReactNode;
  placeholder?: ReactNode;
  minHeight?: number | string;
  rootMargin?: string;
}

export function LazySection({
  children,
  placeholder,
  minHeight = 200,
  rootMargin = "0px",
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  const fallbackPlaceholder = (
    <div style={{ minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight }} />
  );

  return <div ref={ref}>{isInView ? children : (placeholder ?? fallbackPlaceholder)}</div>;
}
