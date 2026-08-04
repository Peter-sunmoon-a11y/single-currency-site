import { CommonBanner } from "@/sections/casino/hero-banner/template/CommonBanner.tsx";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useEffect, useState } from "react";

export function HeroBannerCarousel({ slides }: { slides: Record<string, any>[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", duration: 20 },
    [Autoplay({ delay: 6_000, stopOnInteraction: true, playOnInit: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onInit = useCallback((api: EmblaCarouselType) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit).on("reInit", onSelect).on("select", onSelect);
    return () => {
      emblaApi.off("reInit", onInit).off("reInit", onSelect).off("select", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const id = setTimeout(() => emblaApi.plugins().autoplay?.play(), 5_0000000);
    return () => clearTimeout(id);
  }, [emblaApi]);

  const onDotClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.plugins().autoplay?.stop();
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  return (
    <>
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full touch-pan-y [backface-visibility:hidden]">
          {slides.map((item, i) => (
            <CommonBanner key={item?.id ?? i} content={item?.content} isPriority={i === 0} />
          ))}
        </div>
      </div>

      {scrollSnaps.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 sm:hidden flex items-center gap-2 h-4">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onDotClick(i)}
              className={`rounded-full transition-all duration-300 ${
                i === selectedIndex ? "w-3 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
