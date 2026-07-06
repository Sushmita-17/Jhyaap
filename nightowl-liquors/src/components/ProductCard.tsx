import { useAppStore } from '@/store/appStore';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { Product } from '@/types';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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
      className={`group relative border rounded-[14px] overflow-hidden cursor-pointer transition-all duration-300 active:scale-[0.98] hover:border-gold-primary/50 hover:shadow-[0_8px_24px_rgba(201,168,76,0.15)] flex flex-col h-full w-full box-border select-none ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-gradient-to-br from-[#111111] to-[#0A0A0A] border-white/[0.08]'
      }`}
    >
      {/* Image */}
      <div className="relative flex-shrink-0 h-[130px] sm:h-[110px] lg:h-[180px] flex items-center justify-center bg-gradient-to-b from-white/[0.05] to-white/[0.02] rounded-t-[14px] overflow-hidden">
        {discount > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[#F5A623] to-[#E8941F] text-black text-[8px] sm:text-[7px] font-bold px-1.5 py-0.5 rounded-[4px] shadow-lg shadow-orange-500/20 uppercase tracking-wide">
            {discount}% OFF
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="h-[85%] w-[85%] object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
          loading="lazy"
          decoding="async"
        />
        {/* Subtle shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 px-2.5 pt-2 pb-2.5 gap-1 sm:px-3 sm:pt-2.5 sm:pb-3 lg:px-4 lg:pt-3 lg:pb-4">
        <p className={`text-[10px] sm:text-[8px] font-semibold uppercase tracking-[0.08em] truncate ${
          isLight ? 'text-gray-500' : 'text-[#888]'
        }`}>
          {product.brand}
        </p>
        <h2 className={`text-[12px] sm:text-[11px] font-semibold leading-snug line-clamp-2 flex-1 lg:text-[14px] ${
          isLight ? 'text-gray-900' : 'text-white'
        }`}>
          {product.name}
        </h2>

        {/* Price row */}
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className={`text-[15px] sm:text-[13px] font-black lg:text-[18px] ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>
            Rs.{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className={`text-[10px] sm:text-[9px] line-through ${
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
            className="mt-1 w-full flex items-center justify-center gap-1 rounded-[8px] bg-gradient-to-r from-[#F5A623] to-[#E8941F] py-[6px] text-[10px] sm:text-[9px] font-bold uppercase tracking-[0.05em] text-black transition-all hover:from-[#FFB84D] hover:to-[#F5A623] active:scale-95 shadow-lg shadow-orange-500/20 sm:mt-2 sm:py-[7px] lg:mt-3 lg:py-2.5 lg:text-[12px]"
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 flex-shrink-0" />
            Add to Cart
          </button>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`mt-1 flex items-center justify-between rounded-[8px] border border-[#F5A623]/40 px-2 py-[5px] sm:mt-2 sm:px-1.5 sm:py-[6px] lg:mt-3 lg:px-2.5 lg:py-[7px] shadow-inner ${
              isLight ? 'bg-gray-100' : 'bg-[#0D0D0D]'
            }`}
          >
            <button
              onClick={handleDecrease}
              aria-label="Decrease"
              className="flex h-[22px] w-[22px] sm:h-[20px] sm:w-[20px] lg:h-[26px] lg:w-[26px] items-center justify-center rounded-[6px] bg-white/5 hover:bg-white/10 active:bg-white/20 text-gold-primary transition-colors"
            >
              <span className="text-[14px] sm:text-[13px] lg:text-[16px] font-black leading-none">−</span>
            </button>
            <button onClick={handleGoToCart} className={`text-[12px] sm:text-[11px] lg:text-[14px] font-black min-w-[22px] sm:min-w-[20px] lg:min-w-[26px] text-center ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              {quantity}
            </button>
            <button
              onClick={handleIncrease}
              aria-label="Increase"
              className="flex h-[22px] w-[22px] sm:h-[20px] sm:w-[20px] lg:h-[26px] lg:w-[26px] items-center justify-center rounded-[6px] bg-white/5 hover:bg-white/10 active:bg-white/20 text-gold-primary transition-colors"
            >
              <span className="text-[14px] sm:text-[13px] lg:text-[16px] font-black leading-none">+</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
