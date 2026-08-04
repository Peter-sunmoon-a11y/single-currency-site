import type { CarouselOptions } from './types'

// ----------------------------------------------------------------------

type ObjectValue = {
  [key: string]: string | number
}

type InputValue = CarouselOptions['slidesToShow']

export function getSlideSize(slidesToShow: InputValue): InputValue {
  if (slidesToShow && typeof slidesToShow === 'object') {
    return Object.keys(slidesToShow).reduce<ObjectValue>((acc, key) => {
      const sizeByKey = slidesToShow[key as string]
      acc[key] = getValue(sizeByKey)
      return acc
    }, {})
  }

  return getValue(slidesToShow)
}

function getValue(value: string | number = 1): string {
  if (typeof value === 'string') {
    const isSupported = value === 'auto' || value.endsWith('%') || value.endsWith('px')

    if (!isSupported) {
      throw new Error(`Only accepts values: auto, px, %, or number.`)
    }
    return `0 0 ${value}`
  }

  if (typeof value === 'number') {
    return `0 0 ${100 / value}%`
  }

  throw new Error(`Invalid value type. Only accepts values: auto, px, %, or number.`)
}
