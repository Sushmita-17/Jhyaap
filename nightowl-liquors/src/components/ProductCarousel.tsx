import { Product } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { useThemeStore } from '@/store/themeStore';

interface ProductCarouselProps {
  label?: string;
  title: string;
  className?: string;
  products: Product[];
  onAction?: () => void;
  actionLabel?: string;
  showHeader?: boolean;
}

export default function ProductCarousel({
  label,
  title,
  className = '',
  products,
  onAction,
  actionLabel = 'View all',
  showHeader = true,
}: ProductCarouselProps) {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  // IMPORTANT: don't reuse one ref across multiple conditionally-rendered scroll tracks.
  // Otherwise the scroll measurement/arrows can get out of sync on mobile/tablet.
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const tabletScrollRef = useRef<HTMLDivElement>(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const getActiveScrollEl = () => {
    const w = window.innerWidth;
    // Desktop (>= md): first block uses desktopScrollRef
    if (w >= 768) {
      // Tablet (< lg): second block uses tabletScrollRef
      if (w < 1024) return tabletScrollRef.current;
      return desktopScrollRef.current;
    }
    // Mobile (< md)
    return mobileScrollRef.current;
  };

  const checkScroll = () => {
    const el = getActiveScrollEl();
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    // Measure after paint + after images settle a bit.
    const raf = requestAnimationFrame(() => checkScroll());
    const t1 = window.setTimeout(() => checkScroll(), 150);
    const t2 = window.setTimeout(() => checkScroll(), 450);

    window.addEventListener('resize', checkScroll);

    // Remove artificial delay for instant rendering
    setIsLoading(false);

    return () => {
      window.removeEventListener('resize', checkScroll);
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    const el = getActiveScrollEl();
    if (!el) return;

    const { clientWidth } = el;
    const isMobile = window.innerWidth < 768;
    const step = isMobile ? Math.max(160, Math.round(clientWidth * 0.52)) : clientWidth;
    const scrollAmount = direction === 'left' ? -step : step;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    window.setTimeout(checkScroll, 250);
  };

  if (products.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="max-w-[1248px] mx-auto px-0 relative group/carousel">
        {/* Section Header */}
        <div className="mb-2 px-[6px] md:mb-3 md:px-[8px] lg:mb-4 lg:px-[16px]">
          <div className="flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between md:gap-3">
            <div className="min-w-0">
              {label && (
                <span className="text-[#C9A84C] text-[8px] font-bold uppercase tracking-[1.2px] block mb-0.5 md:text-[9px] lg:text-[10px]">
                  {label}
                </span>
              )}
              <h2 className={`text-[14px] font-bold mb-0 md:text-[16px] lg:text-[18px] ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}>
                {title}
              </h2>
            </div>
            {onAction && (
              <button
                onClick={onAction}
                className={`hidden shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-bold transition-colors hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/10 hover:text-white md:inline-flex md:text-[10px] lg:text-[11px] ${
                  isLight 
                    ? 'border-gray-300 bg-gray-100 text-[#C9A84C] hover:text-gray-900' 
                    : 'border-white/10 bg-white/5 text-[#C9A84C]'
                }`}
              >
                {actionLabel}
              </button>
            )}
          </div>
        </div>

        {/* Desktop: show all items in a fixed grid frame (no horizontal cropping)
            Mobile/Tablet: keep existing carousel behavior */}
        <div className="relative">
          {/* Desktop: horizontal scroll with arrows */}
          <div className="hidden md:block lg:block relative">
            {/* Desktop Arrows */}
            <button
              onClick={() => scroll('left')}
              disabled={!showLeftArrow}
              className={showLeftArrow
                ? `absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center border text-[#C9A84C] shadow-lg shadow-[#C9A84C]/10 transition-all hover:bg-[#C9A84C] hover:text-black ${
                  isLight 
                    ? 'border-gray-300 bg-white hover:border-[#C9A84C]' 
                    : 'border-[#C9A84C]/30 bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D]'
                }`
                : `absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center border text-[#C9A84C]/35 shadow-lg shadow-[#C9A84C]/10 transition-all cursor-default ${
                  isLight 
                    ? 'border-gray-300 bg-white/70' 
                    : 'border-[#C9A84C]/30 bg-gradient-to-br from-[#1A1A1A]/70 to-[#0D0D0D]/70'
                }`
              }
              aria-label="Scroll left"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!showRightArrow}
              className={showRightArrow
                ? `absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center border text-[#C9A84C] shadow-lg shadow-[#C9A84C]/10 transition-all hover:bg-[#C9A84C] hover:text-black ${
                  isLight 
                    ? 'border-gray-300 bg-white hover:border-[#C9A84C]' 
                    : 'border-[#C9A84C]/30 bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D]'
                }`
                : `absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center border text-[#C9A84C]/35 shadow-lg shadow-[#C9A84C]/10 transition-all cursor-default ${
                  isLight 
                    ? 'border-gray-300 bg-white/70' 
                    : 'border-[#C9A84C]/30 bg-gradient-to-br from-[#1A1A1A]/70 to-[#0D0D0D]/70'
                }`
              }
              aria-label="Scroll right"
            >
              <ChevronRight size={22} />
            </button>
            {/* Scroll Track (Desktop) */}
            <div
              ref={desktopScrollRef}
              onScroll={checkScroll}
              className="flex gap-[16px] overflow-x-auto hide-scrollbar snap-x snap-mandatory px-[16px] pb-4 box-border scroll-smooth"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
            >
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="flex-[0_0_220px] min-w-[220px] snap-start box-border">
                      <ProductCardSkeleton />
                    </div>
                  ))
                : products.map((product) => (
                    <div
                      key={product.id}
                      className="flex-[0_0_220px] min-w-[220px] snap-start box-border"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
            </div>
          </div>

          {/* Mobile: horizontal scroll with 2 columns visible and scroll buttons */}
          <div className="md:hidden lg:hidden relative">
            {/* Mobile Arrows */}
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className={`absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 border rounded-full flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all shadow-lg shadow-[#C9A84C]/10 ${
                  isLight 
                    ? 'bg-white border-gray-300' 
                    : 'bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-[#C9A84C]/30'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className={`absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 border rounded-full flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all shadow-lg shadow-[#C9A84C]/10 ${
                  isLight 
                    ? 'bg-white border-gray-300' 
                    : 'bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-[#C9A84C]/30'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            )}

            {/* Scroll Track - Shows exactly 2 cards */}
            <div
              ref={mobileScrollRef}
              onScroll={checkScroll}
              className="flex gap-[10px] overflow-x-auto hide-scrollbar snap-x snap-mandatory px-[6px] pb-2 box-border scroll-smooth"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
            >
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="flex-[0_0_calc(50%-5px)] min-w-[calc(50%-5px)] snap-start box-border">
                      <ProductCardSkeleton />
                    </div>
                  ))
                : products.map((product) => (
                    <div
                      key={product.id}
                      className="flex-[0_0_calc(50%-5px)] min-w-[calc(50%-5px)] snap-start box-border"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
            </div>
          </div>

          {/* Tablet: carousel with arrows */}
          <div className="hidden md:block lg:hidden relative">
            {/* Tablet Arrows */}
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 border rounded-full flex items-center justify-center text-[#C9A84C] hover:bg-[#2A2A2A] hover:text-white transition-all shadow-xl ${
                  isLight 
                    ? 'bg-white border-gray-300 hover:bg-gray-200 hover:text-gray-900' 
                    : 'bg-[#1A1A1A]/90 border-[#2A2A2A]'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 border rounded-full flex items-center justify-center text-[#C9A84C] hover:bg-[#2A2A2A] hover:text-white transition-all shadow-xl ${
                  isLight 
                    ? 'bg-white border-gray-300 hover:bg-gray-200 hover:text-gray-900' 
                    : 'bg-[#1A1A1A]/90 border-[#2A2A2A]'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Scroll Track (Tablet) */}
            <div
              ref={tabletScrollRef}
              onScroll={checkScroll}
              className="flex gap-[10px] overflow-x-auto hide-scrollbar snap-x snap-mandatory px-[8px] pb-2 box-border scroll-smooth"
            >
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="flex-[0_0_180px] min-w-[180px] snap-start box-border">
                      <ProductCardSkeleton />
                    </div>
                  ))
                : products.map((product) => (
                    <div
                      key={product.id}
                      className="flex-[0_0_180px] min-w-[180px] snap-start box-border"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
