import { useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag, ShoppingCart, Tag, Trash2, Navigation, Truck, ShieldCheck, ChevronRight, Lock, MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAppStore } from '@/store/appStore';
import { useThemeStore } from '@/store/themeStore';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getFinalTotal, getTotalPrice, getDiscount } = useCartStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  // Ensure numeric values even if store doesn't expose derived fields
  const subtotal = getTotalPrice();
  const discount = getDiscount();
  const total = getFinalTotal();
  const { setPage } = useAppStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState(null);
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
      <div className={`min-h-[60vh] flex flex-col items-center justify-center p-4 ${
        isLight ? 'bg-gray-50' : 'bg-[#0F0B08]'
      }`}>
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border ${
          isLight 
            ? 'bg-gray-100 border-gray-200' 
            : 'bg-[#1A1410] border-[#2E2318]'
        }`}>
          <ShoppingBag size={40} className={`opacity-40 ${isLight ? 'text-gray-400' : 'text-[#A89070]'}`} />
        </div>
        <h1 className={`font-serif text-3xl mb-2 ${isLight ? 'text-gray-900' : 'text-[#F5ECD7]'}`}>Your Bag is Empty</h1>
        <p className={`mb-8 text-center max-w-md ${isLight ? 'text-gray-500' : 'text-[#A89070]'}`}>Items you add to your bag will appear here. Start exploring our premium collection.</p>
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
    <div className={`pb-[50px] md:pb-[60px] ${isLight ? 'bg-gray-50' : 'bg-[#0F0B08]'}`}>
      <div className="max-w-[1024px] mx-auto px-3 md:px-4">
        
        {/* OUTER CONTAINER */}
        <div className={`rounded-[12px] md:rounded-[16px] shadow-2xl relative overflow-hidden border ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-[#110E0A] border-[#2E2318]'
        }`}>
          
          {/* HEADER SECTION */}
          <div className={`p-4 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 border-b ${
            isLight ? 'border-gray-200' : 'border-[#2E2318]'
          }`}>
            <div>
              <h1 className={`font-serif text-[24px] md:text-[40px] leading-tight select-none ${
                isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
              }`}>Your Cart</h1>
              <p className={`text-[10px] md:text-[11px] font-medium tracking-wide mt-0.5 md:mt-1 uppercase opacity-60 ${
                isLight ? 'text-gray-500' : 'text-[#A89070]'
              }`}>
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
                      : isLight ? 'border-gray-300 text-gray-400' : 'border-[#2E2318] text-[#A89070]/40'
                  }`}>
                    {step.n}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    step.n === 1 ? 'text-[#C9A84C]' : isLight ? 'text-gray-400' : 'text-[#A89070]/40'
                  }`}>
                    {step.label}
                  </span>
                  {step.n < 3 && <div className={`w-4 h-[1px] ml-2 ${isLight ? 'bg-gray-300' : 'bg-[#2E2318]'}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* INNER CARD (Grid) */}
          <div className={`m-3 md:m-4 lg:m-8 rounded-[10px] md:rounded-[12px] overflow-hidden border ${
            isLight 
              ? 'bg-gray-50 border-gray-200' 
              : 'bg-[#1A1410] border-[#2E2318]'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] lg:h-[560px]">
              
              {/* LEFT COLUMN: REVIEW SELECTION */}
              <div className={`flex flex-col relative border-r min-h-0 ${
                isLight ? 'border-gray-200' : 'border-[#2E2318]'
              }`}>
                {/* Fixed Sub-header */}
                <div className={`p-3 md:p-4 flex justify-between items-center z-10 border-b ${
                  isLight 
                    ? 'bg-gray-100 border-gray-200' 
                    : 'bg-[#1A1410] border-[#2E2318]/40'
                }`}>
                  <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-80 ${
                    isLight ? 'text-gray-600' : 'text-[#A89070]'
                  }`}>Review Selection</span>
                  <div className="px-2 md:px-3 py-0.5 md:py-1 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-full">
                    <span className="text-[#C9A84C] text-[8px] md:text-[9px] font-black">{items.length} ITEMS</span>
                  </div>
                </div>

                {/* Scrollable Items */}
                <div className="flex-1 overflow-y-auto custom-cart-scrollbar p-0 min-h-0 pr-[2px]">
                  {items.map((item, idx) => (
                    <div 
                      key={item.product.id} 
                      className={`p-3 md:p-5 flex gap-3 md:gap-5 group transition-colors hover:bg-white/[0.02] ${
                        idx !== items.length - 1 ? 'border-b' : ''
                      } ${isLight ? 'border-gray-200 hover:bg-gray-50' : 'border-[#2E231844]'}`}
                    >
                      {/* Thumbnail */}
                      <div className={`w-[40px] h-[56px] md:w-[48px] md:h-[68px] border rounded-[6px] md:rounded-[7px] shrink-0 p-1.5 md:p-2 flex items-center justify-center ${
                        isLight 
                          ? 'bg-gray-100 border-gray-200' 
                          : 'bg-[#0F0B08] border-[#2E2318]'
                      }`}>
                        <img src={item.product.image} alt="" className="max-h-full max-w-full object-contain" />
                      </div>

                      {/* Info & Actions */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex justify-between items-start gap-2 md:gap-4">
                          <div className="min-w-0">
                            <span className="text-[#C9A84C] text-[8px] md:text-[9px] font-black tracking-[0.1em] uppercase block mb-0.5">
                              {item.product.brand}
                            </span>
                            <h3 className={`text-[11px] md:text-[12px] font-medium leading-tight truncate ${
                              isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                            }`}>
                              {item.product.name}
                            </h3>
                            <p className={`text-[9px] md:text-[10px] mt-0.5 md:mt-1 opacity-70 italic ${
                              isLight ? 'text-gray-500' : 'text-[#A89070]'
                            }`}>
                              {item.product.volume} &middot; {item.product.abv} ABV
                            </p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            {item.product.originalPrice && (
                              <p className={`text-[8px] md:text-[9px] line-through decoration-[#8B1A1A] mb-0.5 opacity-50 font-mono ${
                                isLight ? 'text-gray-400' : 'text-[#A89070]'
                              }`}>
                                Rs {item.product.originalPrice.toLocaleString()}
                              </p>
                            )}
                            <p className="text-[#C9A84C] text-[12px] md:text-[13px] font-mono leading-none">
                              Rs {item.product.price.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Controls Bottom Row */}
                        <div className="flex items-center justify-between mt-auto pt-3 md:pt-4">
                          <div className={`flex items-center border rounded-[4px] overflow-hidden p-[1px] ${
                            isLight 
                              ? 'bg-gray-100 border-gray-200' 
                              : 'bg-[#0F0B08] border-[#2E2318]'
                          }`}>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center transition-colors active:scale-95 ${
                                isLight ? 'text-gray-500 hover:text-gray-900' : 'text-[#A89070] hover:text-[#C9A84C]'
                              }`}
                            >
                              <Minus size={12} />
                            </button>
                            <span className={`w-6 md:w-8 text-center font-mono text-[11px] md:text-[13px] ${
                              isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                            }`}>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center transition-colors active:scale-95 ${
                                isLight ? 'text-gray-500 hover:text-gray-900' : 'text-[#A89070] hover:text-[#C9A84C]'
                              }`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            className={`flex items-center gap-1 md:gap-1.5 transition-colors ${
                              isLight 
                                ? 'text-gray-400 hover:text-red-600' 
                                : 'text-[#A89070]/60 hover:text-[#8B1A1A]'
                            }`}
                          >
                            <Trash2 size={10} />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pinned Footer */}
                <div className={`p-3 md:p-4 border-t flex justify-between items-center shrink-0 ${
                  isLight 
                    ? 'bg-gray-100 border-gray-200' 
                    : 'bg-[#1A1410] border-[#2E2318]'
                }`}>
                  <button
                    onClick={clearCart}
                    className={`flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-colors ${
                      isLight 
                        ? 'text-gray-500 hover:text-red-600' 
                        : 'text-[#A89070] hover:text-[#8B1A1A]'
                    }`}
                  >
                    <Trash2 size={10} />
                    Reset bag
                  </button>
                  <button
                    onClick={() => { setPage('home'); window.scrollTo(0,0); }}
                    className="flex items-center gap-1.5 md:gap-2 text-[#A89070] hover:text-[#C9A84C] transition-colors text-[9px] md:text-[10px] font-black uppercase tracking-widest"
                  >
                    <ArrowLeft size={10} />
                    Continue shopping
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: ORDER SUMMARY */}
              <div className={`flex flex-col min-h-0 ${
                isLight ? 'bg-gray-100' : 'bg-[#141009]'
              }`}>
                
                {/* 1. PROMO CODE (Pinned) */}
                <div className={`p-3 md:p-5 border-b shrink-0 ${
                  isLight ? 'border-gray-200' : 'border-[#2E2318]'
                }`}>
                  <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
                    <Tag size={9} className="text-[#C9A84C]" />
                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-80 ${
                      isLight ? 'text-gray-600' : 'text-[#A89070]'
                    }`}>Promo Code</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className={`flex-1 border rounded-[6px] px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-[11px] tracking-widest focus:outline-none focus:border-[#C9A84C]/50 ${
                        isLight 
                          ? 'bg-white border-gray-300 text-gray-900' 
                          : 'bg-[#0F0B08] border-[#2E2318] text-[#F5ECD7]'
                      }`}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-[#C9A84C] hover:bg-white text-[#0F0B08] px-2 md:px-3 rounded-[6px] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_4px_12px_rgba(201,168,76,0.1)] active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                  
                  {couponCode && (
                    <div className="mt-2 md:mt-3 bg-[#4A9E72]/10 border border-[#4A9E72]/30 text-[#4A9E72] rounded-[6px] p-2 md:p-3 flex items-center gap-2 md:gap-3">
                      <div className="bg-[#4A9E72] rounded-full p-0.5">
                        <Plus className="rotate-45" size={9} color="black" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] md:text-[10px] font-black uppercase leading-none">{couponCode} APPLIED</p>
                        <p className="text-[8px] md:text-[9px] mt-0.5 opacity-80">Enjoy Rs {couponDiscount.toLocaleString()} OFF</p>
                      </div>
                      <button onClick={removeCoupon} className="text-[8px] md:text-[9px] font-bold underline opacity-60 hover:opacity-100">REVOKE</button>
                    </div>
                  )}
                </div>

                {/* 2. ORDER SUMMARY (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-cart-scrollbar p-3 md:p-5 min-h-0">
                  <div className="flex items-center justify-between gap-2 mb-3 md:mb-4">
                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-80 ${
                      isLight ? 'text-gray-600' : 'text-[#A89070]'
                    }`}>Order Summary</span>
                  </div>
                  
                  <div className="mb-4 md:mb-6">
                    <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-2 md:mb-3 block ${
                      isLight ? 'text-gray-400' : 'text-[#A89070]/40'
                    }`}>Items</span>
                    <div className="space-y-2 md:space-y-3">
                      {items.map(item => (
                        <div key={item.product.id} className="flex justify-between items-center text-[10px] md:text-[11px]">
                          <span className={`truncate max-w-[100px] md:max-w-[130px] ${
                            isLight ? 'text-gray-600' : 'text-[#A89070]'
                          }`}>{item.product.name} &times; {item.quantity}</span>
                          <span className={`font-mono whitespace-nowrap ${
                            isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                          }`}>Rs {(item.product.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`h-[0.5px] my-3 md:my-4 ${isLight ? 'bg-gray-200' : 'bg-[#2E2318]'}`} />

                  <div className="space-y-2 md:space-y-3">
                    <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-2 md:mb-3 block ${
                      isLight ? 'text-gray-400' : 'text-[#A89070]/40'
                    }`}>Charges & Discounts</span>
                    <div className="flex justify-between items-center text-[10px] md:text-[11px]">
                      <span className={isLight ? 'text-gray-600' : 'text-[#A89070]'}>Subtotal</span>
                      <span className={`font-mono ${isLight ? 'text-gray-900' : 'text-white'}`}>Rs {subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-[10px] md:text-[11px] text-[#4A9E72]">
                        <span className="uppercase font-bold tracking-tighter">Auto Discount</span>
                        <span className="font-mono">-Rs {discount.toLocaleString()}</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between items-center text-[10px] md:text-[11px] text-[#4A9E72]">
                        <span className="uppercase font-bold tracking-tighter">Code Discount</span>
                        <span className="font-mono">-Rs {couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[10px] md:text-[11px]">
                      <span className={isLight ? 'text-gray-600' : 'text-[#A89070]'}>Delivery Fee</span>
                      <span className={`font-mono ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        {deliveryFee === 0 ? 'FREE' : `Rs ${deliveryFee.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] md:text-[11px]">
                      <span className={isLight ? 'text-gray-600' : 'text-[#A89070]'}>Tax (13% VAT)</span>
                      <span className={`font-mono ${isLight ? 'text-gray-900' : 'text-white'}`}>Rs 0</span>
                    </div>
                  </div>
                </div>

                {/* 3. CHECKOUT (Pinned Bottom) */}
                <div className={`p-3 md:p-4 border-t shrink-0 ${
                  isLight 
                    ? 'bg-gray-100 border-gray-200' 
                    : 'bg-[#141009] border-[#2E2318]'
                }`}>
                  <div className="space-y-1 mb-3 md:mb-4">
                    <div className="flex justify-between items-end">
                      <span className={`text-[11px] md:text-[12px] font-semibold uppercase tracking-wider ${
                        isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                      }`}>Total Due</span>
                      <span className="text-[#C9A84C] text-[17px] md:text-[19px] font-mono leading-none tracking-tighter">Rs {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-[#C9A84C] hover:bg-white text-[#0F0B08] py-3 md:py-4 rounded-[8px] flex items-center justify-center gap-2 group transition-all"
                  >
                    <Lock size={11} className="opacity-80 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.1em]">Proceed to Checkout</span>
                  </button>
                  
                  <div className="mt-3 md:mt-4 flex items-center justify-center gap-1.5 opacity-40">
                    <ShieldCheck size={10} className="text-[#A89070]" />
                    <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${
                      isLight ? 'text-gray-500' : 'text-[#A89070]'
                    }`}>Secure checkout</span>
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
