import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

type ScrollDirection = "left" | "right";

type GameCarouselContextValue = {
  trackRef: React.RefObject<HTMLDivElement | null>;
  scroll: (direction: ScrollDirection) => void;
};

const GameCarouselContext = createContext<GameCarouselContextValue | null>(null);

const useGameCarouselContext = () => useContext(GameCarouselContext);

interface GameCarouselProps {
  children: ReactNode;
  className?: string;
}

const GameCarouselRoot = ({ children, className }: GameCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: ScrollDirection) => {
    const node = trackRef.current;
    if (!node) return;
    const amount = Math.max(200, node.clientWidth * 0.8);
    node.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  return (
    <GameCarouselContext.Provider value={{ trackRef, scroll }}>
      <div className={cn("flex flex-col gap-1 w-full", className)}>{children}</div>
    </GameCarouselContext.Provider>
  );
};

interface GameCarouselHeaderProps {
  children: ReactNode;
  onTitleClick?: () => void;
  onAllClick?: () => void;
  allLabel?: ReactNode;
  showArrows?: boolean;
  className?: string;
}

const GameCarouselHeader = ({
  children,
  onTitleClick,
  onAllClick,
  allLabel,
  showArrows = true,
  className,
}: GameCarouselHeaderProps) => {
  return (
    <div className={cn("flex justify-between items-center", className)}>
      <div
        className={cn("flex items-center gap-1", onTitleClick && "cursor-pointer")}
        onClick={onTitleClick}
      >
        {children}
      </div>
      {(onAllClick || showArrows) && (
        <div className="flex items-center gap-1">
          {onAllClick && allLabel !== undefined && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs text-primary font-bold",
              )}
              onClick={onAllClick}
            >
              {allLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface GameCarouselContentProps {
  children: ReactNode;
  className?: string;
}

const GameCarouselContent = ({ children, className }: GameCarouselContentProps) => (
  <div className={cn("relative overflow-x-hidden", className)}>{children}</div>
);

interface GameCarouselTrackProps {
  children: ReactNode;
  className?: string;
}

const GameCarouselTrack = ({ children, className }: GameCarouselTrackProps) => {
  const context = useGameCarouselContext();
  const fallbackRef = useRef<HTMLDivElement>(null);
  const trackRef = context?.trackRef ?? fallbackRef;

  return (
    <div
      ref={trackRef}
      className={cn(
        "carousel w-full overflow-x-auto rounded-field gap-1 select-none hide-scrollbar",
        className,
      )}
    >
      {children}
    </div>
  );
};

interface GameCarouselItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  lazy?: boolean;
  placeholder?: ReactNode;
  rootMargin?: string;
  unmountOnExit?: boolean;
}

const GameCarouselItem = ({
  children,
  className,
  onClick,
  lazy = false,
  placeholder,
  rootMargin = "0px 120px",
  unmountOnExit = false,
}: GameCarouselItemProps) => {
  const context = useGameCarouselContext();
  const itemRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasEntered, setHasEntered] = useState(!lazy);

  useEffect(() => {
    if (!lazy || !itemRef.current) return;

    const root = context?.trackRef.current ?? null;
    let observer: IntersectionObserver | null = null;
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          setIsInView(true);
          if (!unmountOnExit && observer) {
            observer.disconnect();
          }
        } else if (unmountOnExit) {
          setIsInView(false);
        }
      },
      { root, rootMargin, threshold: 0 },
    );

    observer.observe(itemRef.current);
    return () => observer.disconnect();
  }, [lazy, rootMargin, unmountOnExit, context?.trackRef]);

  const shouldRender = !lazy || (unmountOnExit ? isInView : hasEntered);

  return (
    <div ref={itemRef} className={cn("carousel-item", className)} onClick={onClick}>
      {shouldRender ? children : placeholder ?? null}
    </div>
  );
};

interface GameCarouselFadeProps {
  className?: string;
}

const GameCarouselFade = ({ className }: GameCarouselFadeProps) => (
  <div
    className={cn(
      "absolute w-18 sm:w-36 rtl:left-0 ltr:right-0 top-0 bottom-0 ltr:bg-linear-to-r rtl:bg-linear-to-l from-transparent to-base-300/60 z-20 pointer-events-none",
      className,
    )}
  />
);

interface GameCarouselScrollButtonProps {
  direction: ScrollDirection;
  className?: string;
}

const GameCarouselScrollButton = ({ direction, className }: GameCarouselScrollButtonProps) => {
  const context = useGameCarouselContext();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = context?.trackRef.current;
    if (!node) return;

    const check = () => {
      if (direction === "right") {
        setVisible(node.scrollWidth > node.clientWidth + node.scrollLeft + 1);
      } else {
        setVisible(node.scrollLeft > 1);
      }
    };

    check();
    node.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(node);
    return () => {
      node.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, [context?.trackRef, direction]);

  if (!context || !visible) return null;

  return (
    <button
      aria-label={direction === "right" ? "Scroll right" : "Scroll left"}
      onClick={() => context.scroll(direction)}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center",
        "w-7 h-7 rounded-full bg-base-100/80 backdrop-blur-sm border border-base-content/10",
        "text-base-content/70 hover:text-primary hover:border-primary/40 hover:bg-base-100 transition-colors",
        direction === "right" ? "ltr:right-1 rtl:left-1" : "ltr:left-1 rtl:right-1",
        className,
      )}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {direction === "right" ? <path d="m9 18 6-6-6-6" /> : <path d="m15 18-6-6 6-6" />}
      </svg>
    </button>
  );
};

export const GameCarousel = Object.assign(GameCarouselRoot, {
  Header: GameCarouselHeader,
  Content: GameCarouselContent,
  Track: GameCarouselTrack,
  Item: GameCarouselItem,
  Fade: GameCarouselFade,
  ScrollButton: GameCarouselScrollButton,
});
