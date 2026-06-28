import { useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag, ShoppingCart, Tag, Trash2, Navigation, Truck, ShieldCheck, ChevronRight, Lock, MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAppStore } from '@/store/appStore';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total, subtotal, discount } = useCartStore();
  const { setPage } = useAppStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const deliveryFee = subtotal > 5000 ? 0 : 150;

  const handleProceedToCheckout = () => {
    setPage('checkout');
    window.scrollTo(0, 0);
  };

  const handleApplyCoupon = () => {
    if (couponInput === 'JHYAAP20') {
      setCouponCode('JHYAAP20');
      setCouponDiscount(Math.floor(subtotal * 0.2));
      setCouponInput('');
    } else if (couponInput === 'FIRST100') {
      setCouponCode('FIRST100');
      setCouponDiscount(100);
      setCouponInput('');
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
  };



  if (items.length === 0) {
    return (
      <div className="bg-[#0F0B08] min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-[#1A1410] rounded-full flex items-center justify-center mb-6 border border-[#2E2318]">
          <ShoppingBag size={40} className="text-[#A89070] opacity-40" />
        </div>
        <h1 className="text-[#F5ECD7] font-serif text-3xl mb-2">Your Bag is Empty</h1>
        <p className="text-[#A89070] mb-8 text-center max-w-md">Items you add to your bag will appear here. Start exploring our premium collection.</p>
        <button
          onClick={() => setPage('home')}
          className="bg-[#C9A84C] text-[#0F0B08] px-10 py-4 rounded-[8px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0F0B08] pb-[60px]">
      <div className="max-w-[1024px] mx-auto px-4">
        
        {/* OUTER CONTAINER */}
        <div className="bg-[#110E0A] border-[0.5px] border-[#2E2318] rounded-[16px] shadow-2xl relative overflow-hidden">
          
          {/* HEADER SECTION */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#2E2318]">
            <div>
              <h1 className="text-[#F5ECD7] font-serif text-[32px] md:text-[40px] leading-tight select-none">Your Cart</h1>
              <p className="text-[#A89070] text-[11px] font-medium tracking-wide mt-1 uppercase opacity-60">
                {items.length} item{items.length === 1 ? '' : 's'} ready for checkout
              </p>
            </div>

            {/* STEP INDICATOR */}
            <div className="flex items-center gap-4">
              {[
                { n: 1, label: 'Cart' },
                { n: 2, label: 'Address' },
                { n: 3, label: 'Payment' }
              ].map((step) => (
                <div key={step.n} className="flex items-center gap-2 group">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                    step.n === 1 
                      ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10 ring-4 ring-[#C9A84C]/5' 
                      : 'border-[#2E2318] text-[#A89070]/40'
                  }`}>
                    {step.n}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    step.n === 1 ? 'text-[#C9A84C]' : 'text-[#A89070]/40'
                  }`}>
                    {step.label}
                  </span>
                  {step.n < 3 && <div className="w-4 h-[1px] bg-[#2E2318] ml-2" />}
                </div>
              ))}
            </div>
          </div>

          {/* INNER CARD (Grid) */}
          <div className="m-4 lg:m-8 bg-[#1A1410] border-[0.5px] border-[#2E2318] rounded-[12px] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] h-[520px]">
              
              {/* LEFT COLUMN: REVIEW SELECTION */}
              <div className="flex flex-col relative border-r border-[#2E2318] min-h-0">
                {/* Fixed Sub-header */}
                <div className="p-4 flex justify-between items-center bg-[#1A1410] z-10 border-b border-[#2E2318]/40">
                  <span className="text-[#A89070] text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Review Selection</span>
                  <div className="px-3 py-1 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-full">
                    <span className="text-[#C9A84C] text-[9px] font-black">{items.length} ITEMS</span>
                  </div>
                </div>

                {/* Scrollable Items */}
                <div className="flex-1 overflow-y-auto custom-cart-scrollbar p-0 min-h-0 pr-[2px]">
                  {items.map((item, idx) => (
                    <div 
                      key={item.product.id} 
                      className={`p-5 flex gap-5 group transition-colors hover:bg-white/[0.02] ${
                        idx !== items.length - 1 ? 'border-b border-[#2E231844]' : ''
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-[48px] h-[68px] bg-[#0F0B08] border border-[#2E2318] rounded-[7px] shrink-0 p-2 flex items-center justify-center">
                        <img src={item.product.image} alt="" className="max-h-full max-w-full object-contain" />
                      </div>

                      {/* Info & Actions */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <span className="text-[#C9A84C] text-[9px] font-black tracking-[0.1em] uppercase block mb-1">
                              {item.product.brand}
                            </span>
                            <h3 className="text-[#F5ECD7] text-[12px] font-medium leading-tight truncate">
                              {item.product.name}
                            </h3>
                            <p className="text-[#A89070] text-[10px] mt-1 opacity-70 italic">
                              {item.product.volume} · {item.product.abv} ABV
                            </p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            {item.product.originalPrice && (
                              <p className="text-[#A89070] text-[9px] line-through decoration-[#8B1A1A] mb-0.5 opacity-50 font-mono">
                                Rs {item.product.originalPrice.toLocaleString()}
                              </p>
                            )}
                            <p className="text-[#C9A84C] text-[13px] font-mono leading-none">
                              Rs {item.product.price.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Controls Bottom Row */}
                        <div className="flex items-center justify-between mt-auto pt-4">
                          <div className="flex items-center bg-[#0F0B08] border border-[#2E2318] rounded-[4px] overflow-hidden p-[1px]">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center text-[#A89070] hover:text-[#C9A84C] transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-6 text-center text-[#F5ECD7] font-mono text-[12px]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center text-[#A89070] hover:text-[#C9A84C] transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="flex items-center gap-1.5 text-[#A89070]/60 hover:text-[#8B1A1A] transition-colors"
                          >
                            <Trash2 size={11} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pinned Footer */}
                <div className="p-4 border-t border-[#2E2318] bg-[#1A1410] flex justify-between items-center shrink-0">
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-2 text-[#A89070] hover:text-[#8B1A1A] transition-colors text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100"
                  >
                    <Trash2 size={12} />
                    Reset bag
                  </button>
                  <button
                    onClick={() => { setPage('home'); window.scrollTo(0,0); }}
                    className="flex items-center gap-2 text-[#A89070] hover:text-[#C9A84C] transition-colors text-[10px] font-black uppercase tracking-widest"
                  >
                    <ArrowLeft size={12} />
                    Continue shopping
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: ORDER SUMMARY */}
              <div className="bg-[#141009] flex flex-col min-h-0">
                
                {/* 1. PROMO CODE (Pinned) */}
                <div className="p-5 border-b border-[#2E2318] shrink-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag size={10} className="text-[#C9A84C]" />
                    <span className="text-[#A89070] text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Promo Code</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#0F0B08] border border-[#2E2318] rounded-[6px] px-3 py-2 text-[11px] text-[#F5ECD7] tracking-widest focus:outline-none focus:border-[#C9A84C]/50"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-[#C9A84C] hover:bg-white text-[#0F0B08] px-3 rounded-[6px] text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_4px_12px_rgba(201,168,76,0.1)] active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                  
                  {couponCode && (
                    <div className="mt-3 bg-[#4A9E72]/10 border border-[#4A9E72]/30 text-[#4A9E72] rounded-[6px] p-3 flex items-center gap-3">
                      <div className="bg-[#4A9E72] rounded-full p-0.5">
                        <Plus className="rotate-45" size={10} color="black" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase leading-none">{couponCode} APPLIED</p>
                        <p className="text-[9px] mt-0.5 opacity-80">Enjoy Rs {couponDiscount.toLocaleString()} OFF</p>
                      </div>
                      <button onClick={removeCoupon} className="text-[9px] font-bold underline opacity-60 hover:opacity-100">REVOKE</button>
                    </div>
                  )}
                </div>

                {/* 2. ORDER SUMMARY (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-cart-scrollbar p-5 min-h-0">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[#A89070] text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Order Summary</span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-[#A89070]/40 text-[9px] font-black uppercase tracking-widest mb-3 block">Items</span>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.product.id} className="flex justify-between items-center text-[11px]">
                          <span className="text-[#A89070] truncate max-w-[130px]">{item.product.name} × {item.quantity}</span>
                          <span className="text-[#F5ECD7] font-mono whitespace-nowrap">Rs {(item.product.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-[0.5px] bg-[#2E2318] my-4" />

                  <div className="space-y-3">
                    <span className="text-[#A89070]/40 text-[9px] font-black uppercase tracking-widest mb-3 block">Charges & Discounts</span>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#A89070]">Subtotal</span>
                      <span className="text-white font-mono">Rs {subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-[11px] text-[#4A9E72]">
                        <span className="uppercase font-bold tracking-tighter">Auto Discount</span>
                        <span className="font-mono">−Rs {discount.toLocaleString()}</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between items-center text-[11px] text-[#4A9E72]">
                        <span className="uppercase font-bold tracking-tighter">Code Discount</span>
                        <span className="font-mono">−Rs {couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#A89070]">Delivery Fee</span>
                      <span className="text-white font-mono">
                        {deliveryFee === 0 ? 'FREE' : `Rs ${deliveryFee.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#A89070]">Tax (13% VAT)</span>
                      <span className="text-white font-mono">Rs 0</span>
                    </div>
                  </div>
                </div>

                {/* 3. CHECKOUT (Pinned Bottom) */}
                <div className="p-4 bg-[#141009] border-t border-[#2E2318] shrink-0">
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[#F5ECD7] text-[12px] font-semibold uppercase tracking-wider">Total Due</span>
                      <span className="text-[#C9A84C] text-[19px] font-mono leading-none tracking-tighter">Rs {total.toLocaleString()}</span>
                    </div>
                    <p className="text-right text-[#A89070]/40 text-[9px] italic font-medium uppercase tracking-[0.05em]">All taxes included</p>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-[#C9A84C] hover:bg-white text-[#0F0B08] py-4 rounded-[8px] flex items-center justify-center gap-2 group transition-all"
                  >
                    <Lock size={12} className="opacity-80 group-hover:scale-110 transition-transform" />
                    <span className="text-[12px] font-black uppercase tracking-[0.1em]">Proceed to Checkout</span>
                  </button>
                  
                  <div className="mt-4 flex items-center justify-center gap-1.5 opacity-40">
                    <ShieldCheck size={11} className="text-[#A89070]" />
                    <span className="text-[#A89070] text-[9px] font-bold uppercase tracking-widest">Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
