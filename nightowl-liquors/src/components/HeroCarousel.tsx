import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import { useAppStore } from '@/store/appStore';

export default function HeroCarousel() {
  const banners = useCatalogStore((s) => s.banners);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, duration: 0 }, []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { setPage, setSelectedCategory } = useAppStore();

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  const handleCTA = (link: string) => {
    const category = link.split('category=')[1];
    if (category) {
      setSelectedCategory(category);
      setPage('products');
    }
  };

  return (
    <section className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-night-900 shadow-2xl shadow-black/30">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative">
              <div className="relative h-[310px] overflow-hidden sm:h-[390px] md:h-[440px]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/62 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-night-950/70 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-10 md:px-14">
                  {slide.tag && (
                    <span className="mb-4 inline-flex w-fit rounded bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-neon-amber ring-1 ring-white/10">
                      {slide.tag}
                    </span>
                  )}
                  <h2 className="font-display max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                    {slide.title}
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-6 text-night-200 sm:text-base md:text-lg md:leading-8">
                    {slide.subtitle}
                  </p>
                  <button
                    onClick={() => handleCTA(slide.link)}
                    className="btn-primary mt-7 w-fit text-sm sm:text-base"
                  >
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-white/15 bg-black/45 text-white backdrop-blur-sm transition-all hover:bg-black/70"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-white/15 bg-black/45 text-white backdrop-blur-sm transition-all hover:bg-black/70"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? 'w-8 bg-neon-amber'
                : 'w-2 bg-white/45 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
