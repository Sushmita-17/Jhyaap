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
    <section className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-[#16110F] shadow-2xl shadow-black/30">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative">
              <div className="relative h-[240px] overflow-hidden sm:h-[310px] md:h-[390px] lg:h-[440px]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/62 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 h-20 md:h-28 bg-gradient-to-t from-[#0A0A0A]/70 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-5 sm:px-10 md:px-14">
                  {slide.tag && (
                    <span className="mb-2 md:mb-4 inline-flex w-fit rounded bg-white/10 px-2 md:px-2.5 py-0.5 md:py-1 text-[9px] md:text-[11px] font-semibold uppercase tracking-wide text-[#C9A84C] ring-1 ring-white/10">
                      {slide.tag}
                    </span>
                  )}
                  <h2 className="font-display max-w-xl text-xl md:text-3xl font-bold leading-tight text-white sm:text-2xl md:text-4xl lg:text-5xl">
                    {slide.title}
                  </h2>
                  <p className="mt-2 md:mt-4 max-w-md text-xs md:text-sm leading-5 md:leading-6 text-[#DDDDDD] sm:text-base md:text-lg md:leading-8">
                    {slide.subtitle}
                  </p>
                  <button
                    onClick={() => handleCTA(slide.link)}
                    className="btn-primary mt-4 md:mt-7 w-fit text-xs md:text-sm sm:text-base"
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
        className="absolute left-2 md:left-3 top-1/2 flex h-8 w-8 md:h-10 md:w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-white/15 bg-black/45 text-white backdrop-blur-sm transition-all hover:bg-black/70"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 md:right-3 top-1/2 flex h-8 w-8 md:h-10 md:w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-white/15 bg-black/45 text-white backdrop-blur-sm transition-all hover:bg-black/70"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? 'w-6 md:w-8 bg-[#C9A84C]'
                : 'w-1.5 md:w-2 bg-white/45 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
