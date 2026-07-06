import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Category } from '@/types';

interface CategoryCarouselProps {
  title: string;
  categories: Category[];
  subtitle?: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
  onSelect: (categoryId: string) => void;
  autoplay?: boolean;
}

export default function CategoryCarousel({
  title,
  categories,
  subtitle,
  eyebrow,
  actionLabel,
  onAction,
  onSelect,
}: CategoryCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
      loop: false,
      duration: 0,
    },
    []
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="relative rounded-lg border border-white/10 bg-[#16110F]/55 py-3 md:py-5 shadow-lg shadow-black/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C9A84C]/35" />

      <div className="mb-3 md:mb-5 flex items-end justify-between gap-2 md:gap-4 px-3 md:px-4 sm:px-5">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-0.5 md:mb-1 text-[9px] md:text-[11px] font-semibold uppercase tracking-wide text-[#C9A84C]">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-lg md:text-xl font-bold text-white sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 md:mt-1 max-w-xl text-xs md:text-sm leading-5 md:leading-6 text-[#888888]">{subtitle}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="mr-1.5 md:mr-2 hidden text-xs md:text-sm font-medium text-[#C9A84C] hover:text-[#F5A623] sm:block"
            >
              {actionLabel}
            </button>
          )}
          <button
            onClick={scrollPrev}
            className="rounded-lg border border-white/10 bg-[#0A0A0A]/70 p-1.5 md:p-2 text-[#888888] hover:bg-white/5 hover:text-white"
            aria-label="Previous categories"
          >
            <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <button
            onClick={scrollNext}
            className="rounded-lg border border-white/10 bg-[#0A0A0A]/70 p-1.5 md:p-2 text-[#888888] hover:bg-white/5 hover:text-white"
            aria-label="Next categories"
          >
            <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden px-3 md:px-4 sm:px-5" ref={emblaRef}>
        <div className="flex gap-2.5 md:gap-4 pb-1">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onSelect(category.id)}
              className="group relative aspect-[5/4] overflow-hidden rounded-full cursor-pointer flex-[0_0_140px] md:flex-[0_0_168px] sm:flex-[0_0_190px]"
            >
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/25 to-transparent rounded-full" />
              <div className="absolute inset-x-2 md:inset-x-3 bottom-2 md:bottom-3">
                <p className="font-semibold text-white text-xs md:text-sm">{category.name}</p>
                <p className="mt-0.5 text-[9px] md:text-xs text-[#DDDDDD]">{category.count} in stock</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {actionLabel && onAction && (
        <div className="mt-3 md:mt-4 px-3 md:px-4 sm:hidden">
          <button
            onClick={onAction}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-[#C9A84C] transition-colors hover:bg-white/10"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </section>
  );
}
