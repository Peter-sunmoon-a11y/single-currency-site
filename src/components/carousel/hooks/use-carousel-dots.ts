import type { EmblaCarouselType } from 'embla-carousel';
import type { UseCarouselDotsReturn } from '../types';

import { useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export function useCarouselDots(mainApi?: EmblaCarouselType, enabled = true): UseCarouselDotsReturn {
  const [dotCount, setDotCount] = useState(0);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onClickDot = useCallback(
    (index: number) => {
      if (!mainApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi]
  );

  const onInit = useCallback((_mainApi: EmblaCarouselType) => {
    setScrollSnaps(_mainApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((_mainApi: EmblaCarouselType) => {
    setSelectedIndex(_mainApi.selectedScrollSnap());
    setDotCount(_mainApi.scrollSnapList().length);
  }, []);

  useEffect(() => {
    if (!mainApi || !enabled) return;

    onInit(mainApi);
    onSelect(mainApi);
    mainApi.on('reInit', onInit);
    mainApi.on('reInit', onSelect);
    mainApi.on('select', onSelect);
    return () => {
      mainApi.off('reInit', onInit);
      mainApi.off('reInit', onSelect);
      mainApi.off('select', onSelect);
    };
  }, [mainApi, enabled, onInit, onSelect]);

  return {
    dotCount,
    scrollSnaps,
    selectedIndex,
    onClickDot,
  };
}
