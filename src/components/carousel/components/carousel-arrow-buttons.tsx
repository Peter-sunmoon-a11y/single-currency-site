import type { CarouselArrowButtonsProps } from '../types'

import { cn } from '../../../utils/cn'

import { carouselClasses } from '../classes'
import { ArrowButton } from './arrow-button'

// ----------------------------------------------------------------------

export function CarouselArrowBasicButtons({
  className,
  options,
  onClickPrev,
  onClickNext,
  disablePrev,
  disableNext,
  ...other
}: CarouselArrowButtonsProps) {
  return (
    <div className={cn('inline-flex items-center gap-1 z-10 text-gray-600', carouselClasses.arrows.root, className)} {...other}>
      <ArrowButton variant="prev" options={options} disabled={disablePrev} onClick={onClickPrev} />

      <ArrowButton variant="next" options={options} disabled={disableNext} onClick={onClickNext} />
    </div>
  )
}

// ----------------------------------------------------------------------

export function CarouselArrowFloatButtons({
  className,
  options,
  onClickPrev,
  onClickNext,
  disablePrev,
  disableNext,
}: CarouselArrowButtonsProps) {
  return (
    <>
      <ArrowButton
        variant="prev"
        options={options}
        disabled={disablePrev}
        onClick={onClickPrev}
        className={cn(
          'absolute left-0 rtl:left-auto rtl:right-0 top-1/2 -translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2 z-10 rounded-lg bg-gray-900 text-white hover:opacity-80',
          className,
        )}
      />

      <ArrowButton
        variant="next"
        options={options}
        disabled={disableNext}
        onClick={onClickNext}
        className={cn(
          'absolute right-0 rtl:right-auto rtl:left-0 top-1/2 translate-x-1/2 rtl:-translate-x-1/2 -translate-y-1/2 z-10 rounded-lg bg-gray-900 text-white hover:opacity-80',
          className,
        )}
      />
    </>
  )
}

// ----------------------------------------------------------------------

export function CarouselArrowNumberButtons({
  className,
  options,
  totalSlides,
  onClickPrev,
  onClickNext,
  disablePrev,
  disableNext,
  selectedIndex,
  ...other
}: CarouselArrowButtonsProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 z-10 p-2 text-white rounded-lg bg-gray-900/50',
        carouselClasses.arrows.root,
        className,
      )}
      {...other}
    >
      <ArrowButton variant="prev" options={options} disabled={disablePrev} onClick={onClickPrev} className="rounded-inherit p-3" />

      <span className={cn('mx-2 text-sm font-medium', carouselClasses.arrows.label)}>
        {selectedIndex}/{totalSlides}
      </span>

      <ArrowButton variant="next" options={options} disabled={disableNext} onClick={onClickNext} className="rounded-inherit p-3" />
    </div>
  )
}
