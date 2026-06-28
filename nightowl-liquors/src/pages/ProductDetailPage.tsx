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
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useCartStore } from '@/store/cartStore';
import { useCatalogStore } from '@/store/catalogStore';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage() {
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
      <div className="mx-auto max-w-7xl px-4 py-32 text-center bg-[#0D0908] min-h-screen">
        <Package className="mx-auto h-16 w-16 text-[#C9A84C]/40 mb-6" />
        <p className="text-xl font-serif text-[#F5ECD7]">Product not found</p>
        <button 
          onClick={() => setPage('home')} 
          className="mt-8 bg-[#C9A84C] text-black px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-white transition-all"
        >
          Return to Nightowl
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
    <div className="bg-[#0D0908] min-h-screen pb-20 selection:bg-[#C9A84C]/30">
      {/* Navigation & Header */}
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        <button
          onClick={() => setPage('home')}
          className="group inline-flex items-center gap-2 text-[#888888] hover:text-[#C9A84C] transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Nightowl
        </button>
      </div>

      <div className="max-w-[1000px] mx-auto px-4">
        <div className="bg-[#16110F] border border-white/5 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Visual Section */}
            <div className="p-4 md:p-8 md:border-r border-white/5 bg-[#F5F0E8]/[0.02]">
              <div className="relative aspect-square flex items-center justify-center bg-[#F5F0E8] rounded-[20px] overflow-hidden p-6 md:p-10 group">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110" 
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-[#8B1A1A] text-white px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-tighter shadow-xl">
                    Save {discount}%
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[#C9A84C] text-[9px] font-black tracking-[2px] uppercase px-2 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-full">
                  {product.brand}
                </span>
                <span className="text-[#888888] text-[9px] uppercase tracking-widest">{categoryName}</span>
              </div>

              <h1 className="text-[28px] md:text-[36px] font-serif font-bold text-[#F5ECD7] leading-tight mb-3 lowercase first-letter:uppercase">
                {product.name}
              </h1>

              <p className="text-[#888888] text-xs leading-relaxed mb-6 max-w-[450px]">
                {product.description || "Indulge in the premium taste of original imports. Hand-selected for the night owls who value quality and prompt delivery."}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 mb-8">
                {[
                  { label: 'Volume', value: product.volume || '750ml' },
                  { label: 'Alcohol', value: product.abv || '40%' },
                  { label: 'Original', value: '100% Genuine' },
                ].map((spec) => (
                  <div key={spec.label} className="bg-black/20 border border-white/5 rounded-[12px] p-3 text-center">
                    <p className="text-[8px] uppercase tracking-widest text-[#555555] mb-1">{spec.label}</p>
                    <p className="text-[11px] font-bold text-[#F5ECD7]">{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Pricing & Cart Action */}
              <div className="mt-auto pt-6 border-t border-white/5">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-[#888888] text-[10px] uppercase tracking-widest block mb-1">Your Price</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[28px] font-mono font-bold text-[#C9A84C]">Rs. {product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-[#555555] line-through text-[14px] font-mono">Rs. {product.originalPrice.toLocaleString()}</span>
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

                <div className="flex gap-3">
                  {/* Quantity Logic synced with Cart */}
                  {quantity > 0 && (
                    <div className="flex items-center bg-[#0D0908] rounded-xl border border-white/10 p-0.5">
                      <button
                        onClick={() => removeItem(product.id)}
                        className="w-10 h-10 flex items-center justify-center text-[#C9A84C] hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-[#F5ECD7] font-bold text-md">{quantity}</span>
                      <button
                        onClick={() => addItem(product)}
                        className="w-10 h-10 flex items-center justify-center text-[#C9A84C] hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => quantity > 0 ? setPage('cart') : addItem(product)}
                    disabled={!product.inStock}
                    className="flex-1 bg-[#C9A84C] text-black h-[48px] rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[11px] tracking-widest transition-all hover:bg-white active:scale-95 disabled:grayscale disabled:opacity-50"
                  >
                    {quantity > 0 ? <ChevronRight className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                    {quantity > 0 ? 'My cart' : 'Add to Cart'}
                  </button>
                </div>
                
                {/* Benefits */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#C9A84C]" />
                    <span className="text-[9px] text-[#DDDDDD] font-medium uppercase tracking-tighter">Fast Valley Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
                    <span className="text-[9px] text-[#DDDDDD] font-medium uppercase tracking-tighter">100% Genuine Sip</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 mb-10">
            <h2 className="text-[20px] font-serif font-bold text-[#F5ECD7] mb-6">Pairs well with</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
