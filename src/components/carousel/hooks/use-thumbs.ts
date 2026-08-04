import type { EmblaCarouselType } from 'embla-carousel';
import type { CarouselOptions, UseCarouselThumbsReturn } from '../types';

import useEmblaCarousel from 'embla-carousel-react';
import { useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export function useThumbs(
  mainApi?: EmblaCarouselType,
  options?: Partial<CarouselOptions>,
  enabled = true
): UseCarouselThumbsReturn {
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    ...options,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onClickThumb = useCallback(
    (index: number) => {
      if (!enabled || !mainApi || !thumbsApi) return;
      mainApi.scrollTo(index);
    },
    [enabled, mainApi, thumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!enabled || !mainApi || !thumbsApi) return;
    setSelectedIndex(mainApi.selectedScrollSnap());
    thumbsApi.scrollTo(mainApi.selectedScrollSnap());
  }, [enabled, mainApi, thumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!mainApi || !enabled) return;
    onSelect();
    mainApi.on('select', onSelect);
    mainApi.on('reInit', onSelect);
    return () => {
      mainApi.off('select', onSelect);
      mainApi.off('reInit', onSelect);
    };
  }, [mainApi, enabled, onSelect]);

  return {
    onClickThumb,
    thumbsRef,
    thumbsApi,
    selectedIndex,
  };
}
