import { useEffect, useRef, useState } from "react";

type ScrollDirection = "up" | "down" | null;

interface UseScrollDirectionOptions {
  threshold?: number;
  debounceDelay?: number;
  container?: HTMLElement | null;
}

export function useScrollDirection(options: UseScrollDirectionOptions = {}) {
  const { threshold = 10, debounceDelay = 100, container } = options;
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    let debounceTimer: NodeJS.Timeout;

    const getScrollY = () => {
      return container ? container.scrollTop : window.scrollY;
    };

    const updateScrollDirection = () => {
      const scrollY = getScrollY();
      const scrollDifference = scrollY - lastScrollY.current;

      // Track if user has scrolled past threshold for initial state
      setIsScrolled(scrollY > threshold);

      // Only update direction if scroll difference exceeds threshold
      if (Math.abs(scrollDifference) > threshold) {
        const newDirection = scrollDifference > 0 ? "down" : "up";

        // Debounce the direction change to avoid rapid switching
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          setScrollDirection(newDirection);
        }, debounceDelay);

        lastScrollY.current = scrollY;
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    // Initialize lastScrollY
    lastScrollY.current = getScrollY();

    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
      clearTimeout(debounceTimer);
    };
  }, [threshold, debounceDelay, container]);

  return { scrollDirection, isScrolled };
}
