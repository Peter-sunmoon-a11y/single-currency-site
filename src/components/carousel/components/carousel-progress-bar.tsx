import type { CarouselProgressBarProps } from '../types'

import { cn } from '../../../utils/cn'

import { carouselClasses } from '../classes'

// ----------------------------------------------------------------------

export function CarouselProgressBar({ value, className, ...other }: CarouselProgressBarProps) {
  return (
    <div
      className={cn('h-1.5 max-w-30 w-full rounded-md overflow-hidden relative bg-gray-200', carouselClasses.progress.root, className)}
      {...other}
    >
      <span
        className={cn('absolute top-0 bottom-0 w-full left-[-100%] bg-current', carouselClasses.progress.bar)}
        style={{
          transform: `translate3d(calc(${value} * 1%), 0px, 0px)`,
        }}
      />
    </div>
  )
}
