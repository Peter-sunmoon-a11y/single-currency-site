import type { CarouselProps } from './types'

import { Children, isValidElement } from 'react'
import { cn } from '../../utils/cn'
import { useTranslation } from "@/lib/i18n/react-i18next"

import { carouselClasses } from './classes'
import { CarouselSlide } from './components/carousel-slide'

// ----------------------------------------------------------------------

export function Carousel({ className, carousel, children, ...other }: CarouselProps) {
  const { mainRef, options } = carousel
  const { i18n } = useTranslation()

  const axis = options?.axis ?? 'x'
  const slideSpacing = options?.slideSpacing ?? '0px'

  const renderChildren = () =>
    Children.map(children, child => {
      if (isValidElement(child)) {
        const reactChild = child as React.ReactElement<{ key?: React.Key }>

        return (
          <CarouselSlide key={reactChild.key} options={carousel.options}>
            {child}
          </CarouselSlide>
        )
      }
      return null
    })

  return (
    <div
      key={`carousel-${i18n.language}-${i18n.dir()}`}
      ref={mainRef}
      className={cn('mx-auto max-w-full overflow-hidden relative', axis === 'y' && 'h-full', carouselClasses.root, className)}
      {...other}
    >
      <ul
        className={cn(
          'flex backface-visibility-hidden',
          axis === 'x' && 'touch-pan-y touch-pinch-zoom',
          axis === 'y' && 'h-full flex-col touch-pan-x touch-pinch-zoom',
          carouselClasses.container,
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
