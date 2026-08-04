import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";

export interface SegmentedControlOption {
  value: string;
  label: ReactNode;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  layoutId?: string;
  orientation?: "horizontal" | "vertical";
  buttonClassName?: string;
  isActiveClassName?: string;
}

type HighlightRect = { width: number; height: number; x: number; y: number };

/**
 * 计算当前选中按钮的几何信息，并返回容器/按钮引用注册器
 * 这样可以保持动画独立于按钮本身，避免由于外部布局变化造成的掉帧（例如从Casino大厅切换到Sports大厅），让背景动画过渡时更加平滑。
 */
function useSegmentedHighlight(
  value: string,
  options: SegmentedControlOption[],
  orientation: "horizontal" | "vertical",
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const [rect, setRect] = useState<HighlightRect | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const target = optionRefs.current.get(value);

    if (!container || !target) {
      setRect(null);
      return;
    }

    const containerBox = container.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();

    setRect({
      width: targetBox.width,
      height: targetBox.height,
      x: targetBox.left - containerBox.left,
      y: targetBox.top - containerBox.top,
    });
  }, [value]);

  useLayoutEffect(() => {
    measure();

    const raf1 = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });

    return () => cancelAnimationFrame(raf1);
  }, [measure, options, orientation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => measure());
    ro.observe(container);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const handleResize = () => measure();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measure]);

  const registerOption = useCallback(
    (optionValue: string) => (node: HTMLButtonElement | null) => {
      optionRefs.current.set(optionValue, node);
    },
    [],
  );

  return { containerRef, registerOption, rect };
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  layoutId,
  orientation = "horizontal",
  buttonClassName,
  isActiveClassName,
}: SegmentedControlProps) {
  const isVertical = orientation === "vertical";
  const highlightKey = useId();
  void (layoutId ?? highlightKey); // layoutId kept for API compatibility
  const { containerRef, registerOption, rect } = useSegmentedHighlight(value, options, orientation);

  const buttonBaseClass = useMemo(
    () =>
      cn(
        "relative z-10 flex items-center justify-center rounded-field transition-colors btn btn-sm md:btn-md bg-transparent border-0",
        isVertical ? "w-full" : "flex-1",
      ),
    [isVertical],
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative p-1", isVertical ? "flex flex-col w-full space-y-1" : "flex w-full", className)}
    >
      {rect && (
        <div
          className="absolute z-0 rounded-field bg-primary pointer-events-none transition-all duration-200"
          style={{ top: 0, left: 0, x: rect.x, y: rect.y, width: rect.width, height: rect.height, transform: `translate(${rect.x}px, ${rect.y}px)` }}
        />
      )}

      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            ref={registerOption(option.value)}
            onClick={() => onChange(option.value)}
            className={cn(
              buttonBaseClass,
              isActive ? "text-primary-content"
                : (isActiveClassName ?? "text-base-content/70 hover:text-primary"),
              buttonClassName,
            )}
            style={{ WebkitTapHighlightColor: "transparent" }}
            type="button"
          >
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
