import type { CarouselThumbProps } from '../types'

import { cn } from '../../../utils/cn'

import { carouselClasses } from '../classes'

// ----------------------------------------------------------------------

export function CarouselThumb({ src, index, selected, className, ...other }: CarouselThumbProps) {
  return (
    <button
      type="button"
      className={cn(
        'w-16 h-16 opacity-50 flex-shrink-0 cursor-pointer rounded-lg transition-all duration-200 ease-in-out hover:opacity-75',
        selected && 'opacity-100 shadow-[0_0_0_2px_theme(colors.blue.500)]',
        carouselClasses.thumbs.item,
        className,
      )}
      {...other}
    >
      <img
        alt={`carousel-thumb-${index}`}
        src={src}
        className={cn('w-full h-full object-cover rounded-inherit', carouselClasses.thumbs.image)}
      />
    </button>
  )
}
