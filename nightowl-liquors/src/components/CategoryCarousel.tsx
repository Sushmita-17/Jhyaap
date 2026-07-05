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
    <section className="relative rounded-lg border border-white/10 bg-night-900/55 py-5 shadow-lg shadow-black/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-neon-amber/35" />

      <div className="mb-5 flex items-end justify-between gap-4 px-4 sm:px-5">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neon-amber">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 max-w-xl text-sm leading-6 text-night-400">{subtitle}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="mr-2 hidden text-sm font-medium text-neon-amber hover:text-neon-gold sm:block"
            >
              {actionLabel}
            </button>
          )}
          <button
            onClick={scrollPrev}
            className="rounded-lg border border-white/10 bg-night-950/70 p-2 text-night-300 hover:bg-night-800 hover:text-white"
            aria-label="Previous categories"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={scrollNext}
            className="rounded-lg border border-white/10 bg-night-950/70 p-2 text-night-300 hover:bg-night-800 hover:text-white"
            aria-label="Next categories"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden px-4 sm:px-5" ref={emblaRef}>
        <div className="flex gap-4 pb-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className="group min-w-0 flex-[0_0_168px] overflow-hidden rounded-lg border border-white/10 bg-night-950/60 text-left hover:border-neon-amber/40 hover:bg-night-900 sm:flex-[0_0_190px]"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/25 to-transparent" />
                <div className="absolute inset-x-3 bottom-3">
                  <p className="font-semibold text-white">{category.name}</p>
                  <p className="mt-0.5 text-xs text-night-300">{category.count} in stock</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {actionLabel && onAction && (
        <div className="mt-4 px-4 sm:hidden">
          <button
            onClick={onAction}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-neon-amber transition-colors hover:bg-white/10"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </section>
  );
}
