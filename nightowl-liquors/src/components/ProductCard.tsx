import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { Product } from '@/types';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const quantity = useCartStore((s) => s.getItemQuantity(product.id));
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const { setPage, setSelectedProduct } = useAppStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Entire card navigates to detail page
  const handleCardClick = () => {
    setSelectedProduct(product.id);
    setPage('product');
  };

  // Cart controls stop propagation so they don't trigger navigation
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, quantity - 1);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, quantity + 1);
  };

  const handleGoToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPage('cart');
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative border rounded-[12px] overflow-hidden cursor-pointer transition-all duration-300 active:scale-[0.97] hover:border-gold-primary/60 hover:shadow-lg ${
        viewMode === 'list' ? 'flex-col h-auto w-full mx-auto max-w-[600px]' : 'flex-col h-full w-full'
      } box-border select-none ${
        isLight 
          ? 'bg-white border-gray-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]' 
          : 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/[0.12] hover:shadow-[0_8px_24px_rgba(201,168,76,0.2)]'
      }`}
    >
      {/* Image */}
      <div className={`relative flex-shrink-0 flex items-center justify-center bg-gradient-to-b from-white/[0.08] to-white/[0.02] overflow-hidden ${
        viewMode === 'list' ? 'w-full h-[100px] sm:h-[110px] md:h-[140px] lg:h-[160px] rounded-t-[12px]' : 'h-[130px] sm:h-[110px] lg:h-[180px] rounded-t-[14px]'
      }`}>
        {discount > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[#F5A623] to-[#E8941F] text-black text-[8px] sm:text-[7px] font-bold px-1.5 py-0.5 rounded-[4px] shadow-lg shadow-orange-500/30 uppercase tracking-wide">
            {discount}% OFF
          </span>
        )}

        <img
          src={product.image}
          alt={product.name}
          className={`object-contain transition-all duration-500 group-hover:scale-110 drop-shadow-md ${
            viewMode === 'list' ? 'h-[65%] w-[65%] sm:h-[70%] sm:w-[70%] md:h-[75%] md:w-[75%]' : 'h-[85%] w-[85%]'
          }`}
          loading="lazy"
          decoding="async"
        />
        {/* Subtle shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Info */}
      <div className={`flex flex-col ${
        viewMode === 'list' ? 'px-3 py-2.5 sm:px-4 sm:py-3 justify-center items-center gap-1 text-center' : 'flex-1 px-2.5 pt-2 pb-2.5 gap-1 sm:px-3 sm:pt-2.5 sm:pb-3 lg:px-4 lg:pt-3 lg:pb-4 gap-1'
      }`}>
        <p className={`text-[9px] sm:text-[8px] font-semibold uppercase tracking-[0.08em] truncate ${
          isLight ? 'text-gray-500' : 'text-[#888]'
        }`}>
          {product.brand}
        </p>
        <h2 className={`font-semibold leading-snug line-clamp-2 min-h-[2.4em] ${
          viewMode === 'list' ? 'text-[12px] sm:text-[13px]' : 'text-[12px] sm:text-[11px] lg:text-[14px]'
        } ${
          isLight ? 'text-gray-900' : 'text-white'
        }`}>
          {product.name}
        </h2>

        {/* Price row */}
        <div className="flex items-baseline gap-1 mt-0.5 justify-center">
          <span className={`font-black ${
            viewMode === 'list' ? 'text-[14px] sm:text-[15px]' : 'text-[15px] sm:text-[13px] lg:text-[18px]'
          } ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>
            Rs.{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className={`text-[9px] sm:text-[9px] line-through ${
              isLight ? 'text-gray-400' : 'text-[#555]'
            }`}>
              Rs.{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Cart button — stopPropagation prevents page navigation */}
        {quantity <= 0 ? (
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-1 rounded-[6px] bg-gradient-to-r from-[#F5A623] to-[#E8941F] py-[5px] text-[9px] sm:text-[9px] font-bold uppercase tracking-[0.05em] text-black transition-all hover:from-[#FFB84D] hover:to-[#F5A623] hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 ${
              viewMode === 'list' ? 'mt-1.5 w-auto px-4 py-1.5' : 'mt-1 w-full sm:mt-2 sm:py-[7px] lg:mt-3 lg:py-2.5 lg:text-[12px]'
            }`}
          >
            <ShoppingCart className={`flex-shrink-0 ${
              viewMode === 'list' ? 'h-3 w-3' : 'h-3.5 w-3.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4'
            }`} />
            Add to Cart
          </button>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center justify-between rounded-[6px] border border-[#F5A623]/40 shadow-inner ${
              isLight ? 'bg-gray-100' : 'bg-[#0D0D0D]'
            } ${
              viewMode === 'list' ? 'mt-1.5 px-2 py-[4px] w-auto' : 'mt-1 px-2 py-[5px] sm:mt-2 sm:px-1.5 sm:py-[6px] lg:mt-3 lg:px-2.5 lg:py-[7px]'
            }`}
          >
            <button
              onClick={handleDecrease}
              aria-label="Decrease"
              className="flex h-[20px] w-[20px] sm:h-[20px] sm:w-[20px] lg:h-[26px] lg:w-[26px] items-center justify-center rounded-[5px] bg-white/5 hover:bg-white/10 active:bg-white/20 text-gold-primary transition-colors"
            >
              <span className="text-[13px] sm:text-[13px] lg:text-[16px] font-black leading-none">−</span>
            </button>
            <button onClick={handleGoToCart} className={`text-[11px] sm:text-[11px] lg:text-[14px] font-black min-w-[20px] sm:min-w-[20px] lg:min-w-[26px] text-center ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              {quantity}
            </button>
            <button
              onClick={handleIncrease}
              aria-label="Increase"
              className="flex h-[20px] w-[20px] sm:h-[20px] sm:w-[20px] lg:h-[26px] lg:w-[26px] items-center justify-center rounded-[5px] bg-white/5 hover:bg-white/10 active:bg-white/20 text-gold-primary transition-colors"
            >
              <span className="text-[13px] sm:text-[13px] lg:text-[16px] font-black leading-none">+</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
