import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useCartStore } from '@/store/cartStore';
import { useCatalogStore } from '@/store/catalogStore';
import { useThemeStore } from '@/store/themeStore';
import ProductCard from '@/components/ProductCard';
import ProductDetailSkeleton from '@/components/ProductDetailSkeleton';

export default function ProductDetailPage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const { selectedProductId, setPage } = useAppStore();
  const { id } = useParams();
  const { items, addItem, removeItem } = useCartStore();

  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.getCategories());
  const product = useCatalogStore((s) => s.getProductById(selectedProductId || id || ''));

  const cartItem = items.find((i) => i.product.id === product?.id);
  const quantity = cartItem?.quantity || 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedProductId]);

  if (!product) {
    return (
      <div className={`mx-auto max-w-7xl px-4 py-32 text-center min-h-screen ${
        isLight ? 'bg-gray-50' : 'bg-[#0D0908]'
      }`}>
        <Package className={`mx-auto h-16 w-16 mb-6 ${isLight ? 'text-gray-300' : 'text-[#C9A84C]/40'}`} />
        <p className={`text-xl font-serif ${isLight ? 'text-gray-900' : 'text-[#F5ECD7]'}`}>Product not found</p>
        <button
          onClick={() => setPage('home')}
          className="mt-8 bg-[#C9A84C] text-black px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-white transition-all"
        >
          Return to Jhyaap Station
        </button>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const categoryName = categories.find((c) => c.id === product.category)?.name ?? product.category;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className={`min-h-screen pb-20 selection:bg-[#C9A84C]/30 ${
      isLight ? 'bg-gray-50' : 'bg-[#0D0908]'
    }`}>
      {/* Navigation & Header */}
      <div className="max-w-[1000px] mx-auto px-4 py-4 md:py-6">
        <button
          onClick={() => setPage('home')}
          className={`group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            isLight ? 'text-gray-600 hover:text-[#C9A84C]' : 'text-[#888888] hover:text-[#C9A84C]'
          }`}
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Jhyaap Station
        </button>
      </div>

      <div className="max-w-[1000px] mx-auto px-2 md:px-4">
        <div className={`border rounded-[8px] md:rounded-[32px] overflow-hidden shadow-2xl ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-[#16110F] border-white/5'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Visual Section */}
            <div className={`p-1.5 md:p-8 md:border-r border-white/5 ${
              isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#F5F0E8]/[0.02]'
            }`}>
              <div className={`relative aspect-square md:aspect-square max-h-[140px] md:max-h-none flex items-center justify-center rounded-[10px] md:rounded-[20px] overflow-hidden p-1.5 md:p-10 group ${
                isLight ? 'bg-gray-100' : 'bg-[#F5F0E8]'
              }`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-[120px] md:max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110"
                  loading="eager"
                  decoding="async"
                />
                {discount > 0 && (
                  <div className="absolute top-2 left-2 bg-[#8B1A1A] text-white px-2 py-0.5 rounded-full font-black text-[8px] uppercase tracking-tighter shadow-xl">
                    Save {discount}%
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-1.5 md:p-8 flex flex-col">
              <div className="flex items-center gap-0.5 mb-0.5">
                <span className="text-[#C9A84C] text-[5px] md:text-[9px] font-black tracking-[2px] uppercase px-0.5 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-full">
                  {product.brand}
                </span>
                <span className={`text-[5px] md:text-[9px] uppercase tracking-widest ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>{categoryName}</span>
              </div>

              <h1 className={`text-[12px] md:text-[36px] font-serif font-bold leading-tight mb-0.5 md:mb-3 lowercase first-letter:uppercase ${
                isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
              }`}>
                {product.name}
              </h1>

              <p className={`text-[7px] md:text-xs leading-relaxed mb-1.5 md:mb-6 max-w-[450px] ${
                isLight ? 'text-gray-600' : 'text-[#888888]'
              }`}>
                {product.description || "Indulge in the premium taste of original imports. Hand-selected for the night owls who value quality and prompt delivery."}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-0.5 mb-2">
                {[
                  { label: 'Volume', value: product.volume || '750ml' },
                  { label: 'Alcohol', value: product.abv || '40%' },
                  { label: 'Original', value: '100% Genuine' },
                ].map((spec) => (
                  <div key={spec.label} className={`border rounded-[4px] p-0.5 md:p-3 text-center ${
                    isLight 
                      ? 'bg-gray-100 border-gray-200' 
                      : 'bg-black/20 border-white/5'
                  }`}>
                    <p className={`text-[4px] md:text-[8px] uppercase tracking-widest mb-0.5 ${isLight ? 'text-gray-500' : 'text-[#555555]'}`}>{spec.label}</p>
                    <p className={`text-[7px] md:text-[11px] font-bold ${isLight ? 'text-gray-900' : 'text-[#F5ECD7]'}`}>{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Pricing & Cart Action */}
              <div className={`mt-auto pt-1.5 md:pt-6 border-t ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
                <div className="flex items-end justify-between mb-1.5 md:mb-6">
                  <div>
                    <span className={`text-[6px] md:text-[10px] uppercase tracking-widest block mb-0.5 ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Your Price</span>
                    <div className="flex items-center gap-0.5 md:gap-3">
                      <span className="text-[14px] md:text-[28px] font-mono font-bold text-[#C9A84C]">Rs. {product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className={`line-through text-[8px] md:text-[14px] font-mono ${isLight ? 'text-gray-400' : 'text-[#555555]'}`}>Rs. {product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end">
                    <span className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${product.inStock ? 'text-green-500' : 'text-red-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                      {product.inStock ? 'In Stock' : 'Out Stock'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5 md:gap-3">
                  {/* Quantity Logic synced with Cart */}
                  {quantity > 0 && (
                    <div className={`flex items-center rounded-xl border p-0.5 ${
                      isLight 
                        ? 'bg-gray-100 border-gray-200' 
                        : 'bg-[#0D0908] border-white/10'
                    }`}>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="w-5 h-5 md:w-10 md:h-10 flex items-center justify-center text-[#C9A84C] hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Minus size={6} />
                      </button>
                      <span className={`w-3 md:w-8 text-center font-bold text-[9px] md:text-md ${isLight ? 'text-gray-900' : 'text-[#F5ECD7]'}`}>{quantity}</span>
                      <button
                        onClick={() => addItem(product)}
                        className="w-5 h-5 md:w-10 md:h-10 flex items-center justify-center text-[#C9A84C] hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Plus size={6} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => quantity > 0 ? setPage('cart') : addItem(product)}
                    disabled={!product.inStock}
                    className="flex-1 bg-gradient-to-r from-[#F5A623] to-[#E8941F] text-black h-[30px] md:h-[48px] rounded-xl flex items-center justify-center gap-1.5 font-black uppercase text-[7px] md:text-[11px] tracking-widest transition-all hover:from-[#FFB84D] hover:to-[#F5A623] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {quantity > 0 ? <ChevronRight className="h-2 w-2 md:h-4 md:w-4" /> : <ShoppingCart className="h-2 w-2 md:h-4 md:w-4" />}
                    {quantity > 0 ? 'My cart' : 'Add to Cart'}
                  </button>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-1 md:gap-4 mt-1.5 md:mt-6">
                  <div className="flex items-center gap-0.5">
                    <Truck className="w-2 h-2 md:w-4 md:h-4 text-[#C9A84C]" />
                    <span className={`text-[5px] md:text-[9px] font-medium uppercase tracking-tighter ${isLight ? 'text-gray-600' : 'text-[#DDDDDD]'}`}>Fast Valley Delivery</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <ShieldCheck className="w-2 h-2 md:w-4 md:h-4 text-[#C9A84C]" />
                    <span className={`text-[5px] md:text-[9px] font-medium uppercase tracking-tighter ${isLight ? 'text-gray-600' : 'text-[#DDDDDD]'}`}>100% Genuine Sip</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="mt-6 md:mt-12 mb-6 md:mb-10">
            <h2 className={`text-[14px] md:text-[20px] font-serif font-bold mb-3 md:mb-6 ${isLight ? 'text-gray-900' : 'text-[#F5ECD7]'}`}>Pairs well with</h2>
            <div className="relative">
              {/* Desktop scroll buttons */}
              {relatedProducts.length > 2 && (
                <>
                  <button
                    onClick={() => {
                      const el = document.getElementById('related-products-scroll');
                      if (el) el.scrollBy({ left: -240, behavior: 'smooth' });
                    }}
                    className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border rounded-full flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all shadow-lg shadow-[#C9A84C]/10 hidden md:block ${
                      isLight 
                        ? 'bg-white border-gray-300' 
                        : 'bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-[#C9A84C]/30'
                    }`}
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('related-products-scroll');
                      if (el) el.scrollBy({ left: 240, behavior: 'smooth' });
                    }}
                    className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border rounded-full flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all shadow-lg shadow-[#C9A84C]/10 hidden md:block ${
                      isLight 
                        ? 'bg-white border-gray-300' 
                        : 'bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-[#C9A84C]/30'
                    }`}
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
              {/* Mobile scroll buttons */}
              {relatedProducts.length > 2 && (
                <>
                  <button
                    onClick={() => {
                      const el = document.getElementById('related-products-scroll');
                      if (el) el.scrollBy({ left: -window.innerWidth/2 + 16, behavior: 'smooth' });
                    }}
                    className={`absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 border rounded-full flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all shadow-lg shadow-[#C9A84C]/10 md:hidden ${
                      isLight 
                        ? 'bg-white border-gray-300' 
                        : 'bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-[#C9A84C]/30'
                    }`}
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('related-products-scroll');
                      if (el) el.scrollBy({ left: window.innerWidth/2 - 16, behavior: 'smooth' });
                    }}
                    className={`absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 border rounded-full flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all shadow-lg shadow-[#C9A84C]/10 md:hidden ${
                      isLight 
                        ? 'bg-white border-gray-300' 
                        : 'bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-[#C9A84C]/30'
                    }`}
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              <div
                id="related-products-scroll"
                className="flex gap-[10px] md:gap-[16px] overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2 md:pb-4 scroll-smooth"
                style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
              >
                {relatedProducts.map((p) => (
                  <div key={p.id} className="flex-[0_0_calc(50%-5px)] md:flex-[0_0_220px] min-w-[calc(50%-5px)] md:min-w-[220px] snap-start box-border">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

