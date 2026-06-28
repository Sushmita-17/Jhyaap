import { Plus, Minus, ShoppingCart, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useAppStore } from '@/store/appStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, removeItem } = useCartStore();
  const { setPage, setSelectedProduct } = useAppStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="group bg-[#161616] border border-[#222222] rounded-[10px] overflow-hidden transition-all duration-200 hover:border-gold-primary/40 flex flex-col h-full w-full box-border">
      {/* Image Area */}
      <div className="relative h-[150px] md:h-[180px] bg-[#F5F0E8] overflow-hidden flex items-center justify-center p-3">
        {/* VIEW DETAILS HORIZONTAL BAR TRIGGER */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-[#C9A84C]/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20 cursor-pointer backdrop-blur-sm"
             onClick={(e) => {
               e.stopPropagation();
               setSelectedProduct(product.id);
               setPage('product');
             }}
        >
          <span className="text-black text-[10px] font-black uppercase tracking-[4px]">View Details</span>
        </div>

        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-gold-primary text-black text-[9px] font-bold px-[7px] py-[2px] rounded-[4px] z-10 shadow-sm">
            {discount}% OFF
          </div>
        )}
        <img 
          src={product.image} 
          alt={product.name} 
          className="max-h-full max-w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gold-primary/20" />

      {/* Info Section */}
      <div className="p-3 bg-[#161616] flex flex-col flex-1 items-center text-center justify-between box-border">
        <div className="w-full">
          <span className="text-[#AAAAAA] text-[9px] font-bold uppercase tracking-[1px] mb-1 block">
            {product.brand}
          </span>
          
          <h1 className="text-white text-[13px] font-semibold mb-1 leading-tight line-clamp-2 min-h-[32px]">
            {product.name}
          </h1>
          
          <div className="flex flex-col items-center gap-1.5 mt-1">
            <span className="text-white text-[14px] font-black">
              Rs. {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-[#555555] text-[10px] line-through">
                Rs.{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 w-full flex flex-col items-center gap-3">
          {quantity > 0 && (
            <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded-[6px] h-8 w-full max-w-[120px]">
              <button
                onClick={() => removeItem(product.id)}
                className="w-8 h-full flex items-center justify-center text-gold-primary hover:text-white transition-all"
              >
                <Minus size={14} className="stroke-[3]" />
              </button>
              <span className="flex-1 text-white text-[13px] font-bold text-center border-x border-white/10 h-full flex items-center justify-center">
                {quantity}
              </span>
              <button
                onClick={() => addItem(product)}
                className="w-8 h-full flex items-center justify-center text-gold-primary hover:text-white transition-all"
              >
                <Plus size={14} className="stroke-[3]" />
              </button>
            </div>
          )}

          <button
            onClick={() => quantity > 0 ? setPage('cart') : addItem(product)}
            className={`w-full py-2.5 rounded-[8px] font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              quantity > 0 
                ? 'bg-gold-primary text-black hover:bg-white shadow-[0_4px_15px_rgba(245,166,35,0.2)]' 
                : 'bg-gold-primary text-black hover:bg-white'
            }`}
          >
            {quantity > 0 ? <ChevronRight size={13} /> : <ShoppingCart size={13} />}
            {quantity > 0 ? "My cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
