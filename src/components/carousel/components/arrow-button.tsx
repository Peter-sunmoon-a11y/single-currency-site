import type { CarouselArrowButtonProps } from "../types";

import { cn } from "../../../utils/cn";

import { carouselClasses } from "../classes";

// ----------------------------------------------------------------------

const prevSvgPath = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <g fill="none" fillRule="evenodd">
      <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
      <path
        fill="currentColor"
        d="M7.94 13.06a1.5 1.5 0 0 1 0-2.12l5.656-5.658a1.5 1.5 0 1 1 2.121 2.122L11.122 12l4.596 4.596a1.5 1.5 0 1 1-2.12 2.122l-5.66-5.658Z"
      />
    </g>
  </svg>
);

const nextSvgPath = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <g fill="none" fillRule="evenodd">
      <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
      <path
        fill="currentColor"
        d="M16.06 10.94a1.5 1.5 0 0 1 0 2.12l-5.656 5.658a1.5 1.5 0 1 1-2.121-2.122L12.879 12L8.283 7.404a1.5 1.5 0 0 1 2.12-2.122l5.658 5.657Z"
      />
    </g>
  </svg>
);

export function ArrowButton({ className, svgIcon, options, variant, svgSize = 20, ...other }: CarouselArrowButtonProps) {
  const isPrev = variant === "prev";

  const svgContent = svgIcon || (isPrev ? prevSvgPath : nextSvgPath);

  return (
    <button
      type="button"
      aria-label={isPrev ? "Prev button" : "Next button"}
      className={cn(
        "rounded-field p-1 transition-all duration-200 ease-in-out bg-base-200 hover:bg-base-100 disabled:opacity-50",
        options?.axis === "y" && "[&>svg]:rotate-90",
        options?.direction === "rtl" && "[&>svg]:scale-x-[-1]",
        carouselClasses.arrows[isPrev ? "prev" : "next"],
        className,
      )}
      {...other}
    >
      <svg className={cn("w-5 h-5 rtl:rotate-y-180", carouselClasses.arrows.svg)} style={{ width: svgSize, height: svgSize }} viewBox="0 0 24 24">
        {svgContent}
      </svg>
    </button>
  );
}
