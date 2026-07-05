import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '@/types';

interface ProductCarouselProps {
  label?: string;
  title: string;
  className?: string;
  products: Product[];
  onAction?: () => void;
  actionLabel?: string;
}

export default function ProductCarousel({ 
  label,
  title, 
  className = "",
  products, 
  onAction,
  actionLabel = "View all →"
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      // Scroll by one card width (approx 25% or 50% depending on screen)
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  if (products.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="max-w-[1248px] mx-auto px-0 relative group/carousel">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3 px-[8px] md:mb-6 md:px-0">
          <div>
            {label && (
              <span className="text-gold-primary text-[10px] md:text-[11px] font-bold uppercase tracking-[1.5px] block mb-1 md:mb-2">
                {label}
              </span>
            )}
            <h2 className="text-xl md:text-[22px] font-bold text-white mb-0">
              {title}
            </h2>
          </div>
          {onAction && (
            <button
              onClick={onAction}
              className="text-xs md:text-sm font-bold text-gold-primary hover:text-white transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>

        {/* Improved Universal Carousel */}
        <div className="relative">
          {/* Desktop Arrows (Floating at Edges) */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 bg-[#1A1A1A]/90 border border-[#2A2A2A] rounded-full flex items-center justify-center text-gold-primary hover:bg-[#2A2A2A] hover:text-white transition-all hidden md:flex shadow-xl"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 bg-[#1A1A1A]/90 border border-[#2A2A2A] rounded-full flex items-center justify-center text-gold-primary hover:bg-[#2A2A2A] hover:text-white transition-all hidden md:flex shadow-xl"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Scroll Track (Both Desktop & Mobile) */}
          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-[10px] md:gap-[16px] overflow-x-auto hide-scrollbar snap-x snap-mandatory px-[8px] md:px-0 pb-3 md:pb-4 box-border scroll-smooth"
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className="flex-[0_0_calc(50vw-13px)] md:flex-[0_0_calc(25%-12px)] min-w-[calc(50vw-13px)] md:min-w-[calc(25%-12px)] snap-start box-border"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
