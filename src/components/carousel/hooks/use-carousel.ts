import type { EmblaPluginType } from 'embla-carousel'
import type { CarouselOptions, UseCarouselReturn } from '../types'

import useEmblaCarousel from 'embla-carousel-react'
import { useMemo } from 'react'

import { useCarouselArrows } from './use-carousel-arrows'
import { useCarouselAutoPlay } from './use-carousel-auto-play'
import { useCarouselAutoScroll } from './use-carousel-auto-scroll'
import { useCarouselDots } from './use-carousel-dots'
import { useParallax } from './use-carousel-parallax'
import { useCarouselProgress } from './use-carousel-progress'
import { useThumbs } from './use-thumbs'
import { useTranslation } from "@/lib/i18n/react-i18next"

// ----------------------------------------------------------------------

export const useCarousel = (options?: CarouselOptions, plugins?: EmblaPluginType[]): UseCarouselReturn => {
  const { i18n } = useTranslation()

  const [mainRef, mainApi] = useEmblaCarousel({ ...options, direction: i18n.dir() }, plugins)

  const watch = options?.watch
  const watchArrows = watch?.arrows ?? true
  const watchDots = watch?.dots ?? true
  const watchProgress = watch?.progress ?? true
  const watchThumbs = watch?.thumbs ?? true

  const { disablePrev, disableNext, onClickPrev, onClickNext } = useCarouselArrows(mainApi, watchArrows)

  const pluginNames = useMemo(() => plugins?.map(plugin => plugin.name), [])

  const _dots = useCarouselDots(mainApi, watchDots)

  const _autoplay = useCarouselAutoPlay(mainApi)

  const _autoScroll = useCarouselAutoScroll(mainApi)

  const _progress = useCarouselProgress(mainApi, watchProgress)

  const _thumbs = useThumbs(mainApi, options?.thumbs, watchThumbs)

  useParallax(mainApi, options?.parallax)

  const controls = useMemo(() => {
    if (pluginNames?.includes('autoplay')) {
      return {
        onClickPrev: () => _autoplay.onClickAutoplay(onClickPrev),
        onClickNext: () => _autoplay.onClickAutoplay(onClickNext),
      }
    }
    if (pluginNames?.includes('autoScroll')) {
      return {
        onClickPrev: () => _autoScroll.onClickAutoplay(onClickPrev),
        onClickNext: () => _autoScroll.onClickAutoplay(onClickNext),
      }
    }
    return { onClickPrev, onClickNext }
  }, [_autoScroll, _autoplay, onClickNext, onClickPrev, pluginNames])

  const mergedOptions = { ...options, ...mainApi?.internalEngine().options }

  return {
    options: mergedOptions,
    pluginNames,
    mainRef,
    mainApi,
    arrows: {
      disablePrev,
      disableNext,
      onClickPrev: controls.onClickPrev,
      onClickNext: controls.onClickNext,
    },
    dots: _dots,
    thumbs: _thumbs,
    progress: _progress,
    autoplay: _autoplay,
    autoScroll: _autoScroll,
  }
}
