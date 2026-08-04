import type { CarouselDotButtonsProps } from "../types";

import { cn } from "../../../utils/cn";

import { carouselClasses } from "../classes";

// ----------------------------------------------------------------------

export function CarouselDotButtons({
  className,
  onClickDot,
  scrollSnaps,
  selectedIndex,
  variant = "circular",
  ...other
}: CarouselDotButtonsProps) {
  const GAPS = { rounded: 2, circular: 1, number: 6 };

  const SIZES = {
    circular: 8,
    rounded: 2,
    number: 28,
  };

  return (
    <ul
      className={cn("flex z-10 items-center", `gap-${GAPS[variant]}`, `h-${SIZES[variant]}`, carouselClasses.dots.root, className)}
      {...other}
    >
      {scrollSnaps.map((_, index) => {
        const selected = index === selectedIndex;

        return (
          <li key={index} className="inline-flex">
            <button
              type="button"
              aria-label={`dot-${index}`}
              className={cn(
                "relative w-4 h-4 rounded-full bg-primary-content/30 transition-all duration-200 ease-in-out",
                selected && "bg-primary",
                variant === "rounded" && selected && "w-full rounded-md",
                variant === "number" && [
                  "w-7 h-7 rounded-full text-xs font-medium border border-gray-300 text-gray-500",
                  selected && "bg-gray-900 text-white border-gray-900",
                ],
                carouselClasses.dots.item,
                selected && carouselClasses.dots.itemSelected,
              )}
              style={{
                width: SIZES[variant],
                height: SIZES[variant],
              }}
              onClick={() => onClickDot(index)}
            >
              {variant === "number" && index + 1}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
