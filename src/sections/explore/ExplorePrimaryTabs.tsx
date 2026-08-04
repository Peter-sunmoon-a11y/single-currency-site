import { useCallback, useEffect, useRef } from "react";
import { t as tFn } from "@/lib/i18n/i18next";
import { cn } from "@/utils/cn";
import Iconify from "@/components/iconify";
// import Iconify from "@/components/iconify";

interface TabItem {
  value: string;
  label: string;
  icon?: string;
  lucideIcon?: string;
  tabIcon?: string;
  tabImage?: string;
  isSpecial?: boolean;
}

interface Props {
  items: TabItem[];
  activeValue: string;
  onSelect: (value: string) => void;
  variant?: "line" | "pill";
  className?: string;
  itemClassName?: string;
}

export function ExplorePrimaryTabs({
  items,
  activeValue,
  onSelect,
  variant = "line",
  className,
  itemClassName
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Scroll so that `button` is centered in the container
  const scrollToButton = useCallback((button: HTMLButtonElement) => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const bRect = button.getBoundingClientRect();
    const scrollLeft =
      container.scrollLeft + bRect.left - cRect.left - (container.clientWidth - bRect.width) / 2;
    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, []);

  // Auto-scroll to active pill on mount and when activeValue changes.
  // Mirrors CurrencyScrollBar: MutationObserver triggers callback, which polls
  // with setInterval until getBoundingClientRect().width > 0 (layout ready).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let closed = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tryScroll = () => {
      if (closed) return;
      const button = buttonRefs.current[activeValue];
      if (!button) return;

      intervalId = setInterval(() => {
        if (closed) {
          clearInterval(intervalId!);
          return;
        }
        const rect = button.getBoundingClientRect();
        if (rect.width > 0) {
          scrollToButton(button);
          clearInterval(intervalId!);
          closed = true;
        }
      }, 50);
    };

    const observer = new MutationObserver(() => {
      if (intervalId) clearInterval(intervalId);
      tryScroll();
    });

    observer.observe(container, { childList: true, subtree: true, attributes: true });
    tryScroll();

    return () => {
      closed = true;
      observer.disconnect();
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeValue, scrollToButton]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex overflow-x-auto hide-scrollbar gap-1",
        variant === "line" ? "" : items.length <= 4 ? "gap-1 justify-end" : "gap-1",
        className
      )}
    >
      {items.map(item => {
        const isActive = activeValue === item.value;
        const isSpecial = item.isSpecial;
        const activeColor = isSpecial ? "text-warning" : "text-primary";

        if (variant === "line") {
          return (
            <button
              key={item.value}
              ref={(el) => {
                buttonRefs.current[item.value] = el;
              }}
              type="button"
              onClick={() => {
                const btn = buttonRefs.current[item.value];
                if (btn) scrollToButton(btn);
                onSelect(item.value);
              }}
              className={cn(
                "font-bold bg-base-100 w-auto relative flex flex-col items-center justify-center shrink-0 px-4 h-11 transition-colors rounded-field",
                isActive ? cn(activeColor, "font-bold") : "text-base-content/70",
                itemClassName
              )}
            >
              {item.tabImage
                ? <img src={item.tabImage} alt="" width={18} height={18} className={cn("object-contain", !isActive && "opacity-50")} />
                : item.icon && <Iconify icon={item.icon} size={18} />
              }
              <span className="text-xs whitespace-nowrap">{tFn(item.label)}</span>
            </button>
          );
        }

        return (
          <button
            key={item.value}
            ref={(el) => {
              buttonRefs.current[item.value] = el;
            }}
            type="button"
            onClick={() => {
              const btn = buttonRefs.current[item.value];
              if (btn) scrollToButton(btn);
              onSelect(item.value);
            }}
            className={cn(
              "relative whitespace-nowrap shrink-0 text-xs px-2 h-8 rounded-field transition-colors",
              isSpecial
                ? isActive ? "bg-warning/20 text-warning font-bold" : "bg-base-100 text-warning/70"
                : isActive ? "bg-primary/20 text-primary font-bold" : "bg-base-100 text-base-content/60",
              itemClassName
            )}
          >
            {tFn(item.label)}
          </button>
        );
      })}
    </div>
  );
}
