import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import type { UseEmblaCarouselType } from 'embla-carousel-react'

// ----------------------------------------------------------------------

/**
 * Dot Buttons
 */
export type UseCarouselDotsReturn = {
  dotCount: number
  selectedIndex: number
  scrollSnaps: number[]
  onClickDot: (index: number) => void
}

export type CarouselDotButtonsProps = React.ComponentProps<'ul'> &
  Omit<UseCarouselDotsReturn, 'dotCount'> & {
    gap?: number
    variant?: 'circular' | 'rounded' | 'number'
    className?: string
  }

/**
 * Prev & Next Buttons
 */
export type UseCarouselArrowsReturn = {
  disablePrev: boolean
  disableNext: boolean
  onClickPrev: () => void
  onClickNext: () => void
}

export type CarouselArrowButtonProps = React.ComponentProps<'button'> & {
  svgSize?: number
  variant: 'prev' | 'next'
  svgIcon?: React.ReactNode
  options?: CarouselArrowButtonsProps['options']
}

export type CarouselArrowButtonsProps = React.ComponentProps<'div'> &
  UseCarouselArrowsReturn & {
    className?: string
    totalSlides?: number
    selectedIndex?: number
    options?: Partial<CarouselOptions>
  }

/**
 * Thumbs
 */
export type UseCarouselThumbsReturn = {
  selectedIndex: number
  thumbsApi?: EmblaCarouselType
  thumbsRef: UseEmblaCarouselType[0]
  onClickThumb: (index: number) => void
}

export type CarouselThumbProps = React.ComponentProps<'button'> & {
  src: string
  index: number
  selected: boolean
}

export type CarouselThumbsProps = React.ComponentProps<'div'> & {
  options?: Partial<CarouselOptions>
  className?: string
}

/**
 * Progress
 */
export type UseCarouselProgressReturn = {
  value: number
}

export type CarouselProgressBarProps = React.ComponentProps<'div'> &
  UseCarouselProgressReturn & {
    className?: string
  }

/**
 * Autoplay
 */
export type UseCarouselAutoPlayReturn = {
  isPlaying: boolean
  onTogglePlay: () => void
  onClickAutoplay: (callback: () => void) => void
}

/**
 * Slide
 */
export type CarouselSlideProps = React.ComponentProps<'li'> & {
  options?: Partial<CarouselOptions>
  className?: string
}

/**
 * Carousel
 */
export type CarouselBaseOptions = EmblaOptionsType & {
  slideSpacing?: string
  parallax?: boolean | number
  slidesToShow?: string | number | Partial<Record<string, string | number>>
}

export type CarouselWatchOptions = {
  arrows?: boolean
  dots?: boolean
  progress?: boolean
  thumbs?: boolean
}

export type CarouselOptions = CarouselBaseOptions & {
  thumbs?: CarouselBaseOptions
  breakpoints?: {
    [key: string]: Omit<CarouselBaseOptions, 'slidesToShow'>
  }
  watch?: CarouselWatchOptions
}

export type UseCarouselReturn = {
  pluginNames?: string[]
  options?: CarouselOptions
  mainRef: UseEmblaCarouselType[0]
  mainApi?: EmblaCarouselType
  thumbs: UseCarouselThumbsReturn
  dots: UseCarouselDotsReturn
  autoplay: UseCarouselAutoPlayReturn
  progress: UseCarouselProgressReturn
  autoScroll: UseCarouselAutoPlayReturn
  arrows: UseCarouselArrowsReturn
}

export type CarouselProps = React.ComponentProps<'div'> & {
  className?: string
  carousel: UseCarouselReturn
}
