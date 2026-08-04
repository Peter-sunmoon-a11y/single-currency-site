import type { CarouselThumbsProps } from '../types'

import { Children, isValidElement } from 'react'
import { cn } from '../../../utils/cn'

import { carouselClasses } from '../classes'
import { CarouselSlide } from './carousel-slide'

// ----------------------------------------------------------------------

export function CarouselThumbs({ options, children, className, ...other }: CarouselThumbsProps) {
  const axis = options?.axis ?? 'x'
  const slideSpacing = options?.slideSpacing ?? '12px'

  const renderChildren = () =>
    Children.map(children, child => {
      if (isValidElement(child)) {
        const reactChild = child as React.ReactElement<{ key?: React.Key }>

        return (
          <CarouselSlide key={reactChild.key} options={{ ...options, slideSpacing }}>
            {child}
          </CarouselSlide>
        )
      }
      return null
    })

  return (
    <div
      className={cn(
        'flex-shrink-0 mx-auto max-w-full overflow-hidden relative p-2',
        axis === 'y' && 'h-full max-h-full',
        carouselClasses.thumbs.root,
        className,
      )}
      {...other}
    >
      <ul
        className={cn(
          'flex backface-visibility-hidden',
          axis === 'x' && 'touch-pan-y touch-pinch-zoom',
          axis === 'y' && 'h-full flex-col touch-pan-x touch-pinch-zoom',
          carouselClasses.thumbs.container,
        )}
        style={{
          marginLeft: axis === 'x' ? `calc(${slideSpacing} * -1)` : undefined,
          marginTop: axis === 'y' ? `calc(${slideSpacing} * -1)` : undefined,
        }}
      >
        {renderChildren()}
      </ul>
    </div>
  )
}
