import type { CarouselSlideProps } from '../types'

import { cn } from '../../../utils/cn'

import { carouselClasses } from '../classes'
import { getSlideSize } from '../utils'

// ----------------------------------------------------------------------

export function CarouselSlide({ className, options, children, ...other }: CarouselSlideProps) {
  const slideSize = getSlideSize(options?.slidesToShow)

  return (
    <li
      className={cn('block relative', options?.axis === 'x' ? 'min-w-0' : 'min-h-0', carouselClasses.slide.root, className)}
      style={{
        paddingLeft: options?.axis === 'x' ? options?.slideSpacing : undefined,
        paddingTop: options?.axis === 'y' ? options?.slideSpacing : undefined,
        flex: typeof slideSize === 'string' ? slideSize : undefined,
      }}
      {...other}
    >
      {options?.parallax ? (
        <div className={cn('overflow-hidden relative rounded-inherit', carouselClasses.slide.content)}>
          <div className={carouselClasses.slide.parallax}>{children}</div>
        </div>
      ) : (
        children
      )}
    </li>
  )
}
