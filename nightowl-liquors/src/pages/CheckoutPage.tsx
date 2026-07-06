import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, MapPin, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useCustomerStore } from '@/store/customerStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { DELIVERY_AREAS } from '@/data/deliveryAreas';
import {
  useLoyaltyStore,
  MIN_REDEEM_POINTS,
  POINTS_TO_RUPEE,
  POINTS_PER_100_RS,
} from '@/store/loyaltyStore';

const paymentMethods = [
  { id: 'cod' as const, label: 'Cash on Delivery', detail: 'Pay when your order arrives' },
  { id: 'esewa' as const, label: 'eSewa', detail: 'Digital wallet payment' },
  { id: 'khalti' as const, label: 'Khalti', detail: 'Fast mobile wallet checkout' },
];

function CheckoutEmptyState({ message, actionLabel, onAction }: { message: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-lg text-night-300">{message}</p>
      <button onClick={onAction} className="btn-primary mt-6">
        {actionLabel}
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  const {
    items,
    getTotalPrice,
    getDiscount,
    getCouponDiscount,
    getPointsDiscount,
    getDeliveryFee,
    getFinalTotal,
    clearCart,
    applyCoupon,
    couponCode,
    removeCoupon,
    pointsToRedeem,
    setPointsToRedeem,
  } = useCartStore();
  const { addresses, addAddress } = useCustomerStore();
  const { createOrder } = useOrdersStore();
  const { user } = useAuthStore();
  const { setPage } = useAppStore();
  const { getPoints, maxRedeemablePoints, pointsToRupees } = useLoyaltyStore();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(addresses[0]?.id || null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'esewa' | 'khalti'>('cod');
  const [notes, setNotes] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(addresses.length === 0);
  const [newAddress, setNewAddress] = useState({ label: '', area: '', street: '', landmark: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  useEffect(() => {
    if (!selectedAddressId && addresses[0]) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddress.label && newAddress.area && newAddress.street) {
      const saved = addAddress({
        ...newAddress,
        isDefault: addresses.length === 0,
      });
      setSelectedAddressId(saved.id);
      setNewAddress({ label: '', area: '', street: '', landmark: '' });
      setShowAddForm(false);
    }
  };

  const handleApplyCoupon = () => {
    if (applyCoupon(couponInput)) {
      setCouponInput('');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !user) return;

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const order = createOrder(
      items,
      selectedAddress,
      paymentMethod,
      getDiscount() + getCouponDiscount() + getPointsDiscount(),
      user.id,
      pointsToRedeem,
      notes
    );

    clearCart();
    useOrdersStore.setState({ selectedOrderId: order.id });
    setPage('order-tracking');
  };

  if (!user) {
    return (
      <CheckoutEmptyState message="Please sign in to complete your order." actionLabel="Sign In" onAction={() => setPage('login')} />
    );
  }

  if (items.length === 0) {
    return (
      <CheckoutEmptyState message="Your cart is empty." actionLabel="Browse Products" onAction={() => setPage('products')} />
    );
  }

  const subtotal = getTotalPrice();
  const discount = getDiscount();
  const couponDiscount = getCouponDiscount();
  const pointsDiscount = getPointsDiscount();
  const deliveryFee = getDeliveryFee();
  const total = getFinalTotal();
  const loyaltyBalance = user ? getPoints(user.id) : 0;
  const maxPoints = user ? maxRedeemablePoints(user.id, subtotal) : 0;
  const estimatedEarn = Math.floor(total / 100) * POINTS_PER_100_RS;

  return (
    <div className="bg-[#0D0908] min-h-screen pb-32 lg:pb-20 selection:bg-[#C9A84C]/30">
      {/* Page Header */}
      <div className="max-w-[1248px] mx-auto px-3 md:px-4 py-4 md:py-8">
        <button
          onClick={() => setPage('cart')}
          className="group inline-flex items-center gap-2 text-[#888888] hover:text-[#C9A84C] transition-colors text-xs font-bold uppercase tracking-wider mb-3"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Cart
        </button>
        <h1 className="text-[24px] md:text-[32px] font-serif font-bold text-[#F5ECD7]">Checkout</h1>
        <p className="text-[#888888] text-xs md:text-sm mt-0.5 md:mt-1">Confirm your details to finalize the night's supply.</p>
      </div>

      <div className="max-w-[1248px] mx-auto px-3 md:px-4 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 md:gap-8">
        
        {/* LEFT: DELIVERY & PAYMENT DETAILS */}
        <div className="space-y-4 md:space-y-6">
          
          {/* Delivery Address Section */}
          <section className="bg-[#16110F] border border-white/5 rounded-[16px] md:rounded-[24px] p-4 md:p-6 shadow-xl">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <MapPin className="h-4 w-4 md:h-5 md:w-5 text-[#C9A84C]" />
              <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-widest text-[#F5ECD7]">Delivery address</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-2 md:gap-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`relative flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedAddressId === addr.id 
                    ? 'bg-[#C9A84C]/10 border-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.1)]' 
                    : 'bg-black/20 border-white/5 hover:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddressId === addr.id}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="mt-0.5 md:mt-1 accent-[#C9A84C]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <p className="font-bold text-[#F5ECD7] text-xs md:text-sm">{addr.label}</p>
                      {addr.isDefault && <span className="bg-[#C9A84C]/20 text-[#C9A84C] text-[8px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-full uppercase">Default</span>}
                    </div>
                    <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-[#888888]">
                      {addr.street}, {addr.area}
                    </p>
                    {addr.landmark && <p className="text-[10px] md:text-[11px] text-[#555555] mt-0.5 italic">{addr.landmark}</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] md:text-[11px] font-mono font-bold text-[#C9A84C]">Rs {addr.deliveryFee}</span>
                  </div>
                </label>
              ))}
            </div>

            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 md:mt-6 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 py-3 md:py-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#888888] hover:border-[#C9A84C]/40 hover:text-[#C9A84C] transition-all"
              >
                <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Add New Delivery Destination
              </button>
            ) : (
              <div className="mt-4 md:mt-6 bg-black/20 border border-white/5 rounded-2xl p-4 md:p-6">
                <h3 className="text-[11px] md:text-[12px] font-black text-[#F5ECD7] uppercase tracking-widest mb-3 md:mb-4">New Address</h3>
                <form onSubmit={handleAddAddress} className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Label (e.g. Home)"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="bg-black/30 border border-white/10 rounded-xl px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                    <select
                      value={newAddress.area}
                      onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                      className="bg-black/30 border border-white/10 rounded-xl px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors appearance-none"
                    >
                      <option value="">Select Area</option>
                      {(['Kathmandu', 'Lalitpur', 'Bhaktapur'] as const).map((city) => (
                        <optgroup key={city} label={city} className="bg-[#16110F]">
                          {DELIVERY_AREAS.filter((a) => a.city === city).map((area) => (
                            <option key={area.name} value={area.name}>
                              {area.name} (Rs {area.deliveryFee})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Street Address / Room No"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Nearby Landmark (House color, shop name...)"
                    value={newAddress.landmark}
                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                  <div className="flex gap-2 md:gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-[#C9A84C] text-black py-2 md:py-3 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-white transition-all">
                      Save & Select
                    </button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-white/5 text-[#888888] py-2 md:py-3 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>

          {/* Payment Method Section */}
          <section className="bg-[#16110F] border border-white/5 rounded-[16px] md:rounded-[24px] p-4 md:p-6 shadow-xl">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-[#C9A84C]" />
              <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-widest text-[#F5ECD7]">Payment method</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`relative flex flex-col items-center text-center p-3 md:p-5 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === method.id 
                    ? 'bg-[#C9A84C]/10 border-[#C9A84C] shadow-[0_0_15px_rgba(201,168,76,0.1)]' 
                    : 'bg-black/20 border-white/5 hover:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                    className="absolute top-3 md:top-4 right-3 md:right-4 accent-[#C9A84C]"
                  />
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#16110F] flex items-center justify-center mb-2 md:mb-3 border border-white/5">
                    <CreditCard className={`w-4 h-4 md:w-5 md:h-5 ${paymentMethod === method.id ? 'text-[#C9A84C]' : 'text-[#888888]'}`} />
                  </div>
                  <p className="font-bold text-[#F5ECD7] text-[11px] md:text-[13px]">{method.label}</p>
                  <p className="text-[9px] md:text-[10px] text-[#555555] mt-0.5 md:mt-1">{method.detail}</p>
                </label>
              ))}
            </div>
          </section>

          {/* Notes Section */}
          <section className="bg-[#16110F] border border-white/5 rounded-[16px] md:rounded-[24px] p-4 md:p-6 shadow-xl">
            <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-widest text-[#F5ECD7] mb-3 md:mb-4">Special instructions</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Ring the bell twice, leave with the guard, or call me upon arrival..."
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-3 md:p-4 text-xs md:text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors h-24 md:h-28 resize-none shadow-inner"
            />
          </section>
        </div>

        {/* RIGHT: BILLING / ORDER SUMMARY */}
        <aside className="space-y-4 md:space-y-6 lg:sticky lg:top-[120px] lg:self-start">
          
          {/* LOYALTY CARD */}
          <div className="bg-[#1C1513] border border-[#C9A84C]/20 rounded-[16px] md:rounded-[24px] p-4 md:p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 md:w-24 md:h-24 bg-[#C9A84C]/5 rounded-full blur-3xl group-hover:bg-[#C9A84C]/10 transition-all duration-500" />
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-[#C9A84C]" />
              <h2 className="text-[11px] md:text-[12px] font-black uppercase tracking-widest text-[#F5ECD7]">Loyalty Rewards</h2>
            </div>
            
            <div className="bg-black/40 rounded-2xl p-3 md:p-4 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] md:text-[11px] text-[#888888]">Available Balance</span>
                <span className="text-[#C9A84C] font-mono font-bold text-xs md:text-sm">{loyaltyBalance} pts</span>
              </div>
              
              {loyaltyBalance >= MIN_REDEEM_POINTS ? (
                <div className="space-y-2 md:space-y-3 mt-3 md:mt-4">
                  <input
                    type="range"
                    min={0}
                    max={maxPoints}
                    step={POINTS_TO_RUPEE}
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] md:text-[10px] text-[#F5ECD7] font-bold">Redeem {pointsToRedeem} pts</span>
                    <span className="text-green-500 font-mono font-bold text-xs md:text-sm">-Rs {pointsDiscount}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPointsToRedeem(maxPoints)}
                    className="w-full py-1.5 md:py-2 border border-[#C9A84C]/20 rounded-lg text-[9px] md:text-[10px] font-black uppercase text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all"
                  >
                    Use Max Points
                  </button>
                </div>
              ) : (
                <p className="text-[9px] md:text-[10px] text-[#555555] italic leading-relaxed">
                  Need {MIN_REDEEM_POINTS} pts to start redeeming. You earn points on every sip!
                </p>
              )}
            </div>
            
            {estimatedEarn > 0 && (
              <p className="mt-3 md:mt-4 text-center text-[9px] md:text-[10px] text-[#888888] font-bold uppercase tracking-wider">
                You'll earn <span className="text-[#C9A84C]">~{estimatedEarn} pts</span> today
              </p>
            )}
          </div>

          {/* FINAL BILL / RECEIPT STYLE */}
          <div className="bg-[#16110F] border border-white/5 rounded-[16px] md:rounded-[24px] overflow-hidden shadow-2xl">
            <div className="bg-[#1E1614] px-4 md:px-6 py-3 md:py-5 border-b border-white/5">
              <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-widest text-[#C9A84C]">Order Summary</h2>
            </div>
            
            {/* The Items List (Receipt Body) */}
            <div className="px-4 md:px-6 py-4 md:py-6 pb-2">
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-start gap-2 md:gap-3 group">
                    <div className="min-w-0">
                      <p className="text-[#F5ECD7] text-[11px] md:text-[13px] font-bold truncate leading-tight">{item.product.name}</p>
                      <p className="text-[#555555] text-[10px] md:text-[11px] mt-0.5">{item.quantity} × Rs {item.product.price.toLocaleString()}</p>
                    </div>
                    <span className="shrink-0 text-[#F5ECD7] font-mono text-[11px] md:text-[13px] font-bold">Rs {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totals Calculation */}
              <div className="space-y-2 md:space-y-3 pt-4 md:pt-6 border-t border-dashed border-white/10">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-[#888888]">Subtotal</span>
                  <span className="text-[#F5ECD7] font-mono font-bold">Rs {subtotal.toLocaleString()}</span>
                </div>
                
                {(discount > 0 || couponDiscount > 0 || pointsDiscount > 0) && (
                  <div className="space-y-1.5 md:space-y-2">
                    {discount > 0 && (
                      <div className="flex justify-between text-xs md:text-sm text-green-500">
                        <span>Sale Discount</span>
                        <span className="font-mono font-bold">-Rs {discount.toLocaleString()}</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-xs md:text-sm text-green-500">
                        <span>Coupon ({couponCode})</span>
                        <span className="font-mono font-bold">-Rs {couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    {pointsDiscount > 0 && (
                      <div className="flex justify-between text-xs md:text-sm text-green-500">
                        <span>Loyalty Redemption</span>
                        <span className="font-mono font-bold">-Rs {pointsDiscount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-[#888888]">Delivery Fee</span>
                  <span className="text-[#F5ECD7] font-mono font-bold">
                    {deliveryFee === 0 ? <span className="text-green-500 uppercase tracking-tighter text-[10px] md:text-[11px]">Free</span> : `Rs ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>

                {/* Grand Total */}
                <div className="bg-black/30 rounded-2xl p-3 md:p-5 mt-4 md:mt-6 border border-white/5 relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-[#C9A84C]" />
                  <div className="flex flex-col">
                    <span className="text-[#888888] text-[9px] md:text-[10px] font-black tracking-[4px] uppercase mb-0.5 md:mb-1">Total Payable</span>
                    <div className="flex items-baseline gap-1.5 md:gap-2">
                      <span className="text-[11px] md:text-[12px] font-mono text-[#F5ECD7]">Rs.</span>
                      <span className="text-[24px] md:text-[32px] font-mono font-bold text-[#C9A84C] tracking-tighter leading-none">
                        {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <div className="px-4 md:px-6 py-4 md:py-6 pt-2">
              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || isProcessing}
                className="w-full bg-[#C9A84C] text-black h-[52px] md:h-[64px] rounded-2xl flex items-center justify-center font-black uppercase tracking-[2px] text-[11px] md:text-[13px] hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(201,168,76,0.3)] disabled:grayscale disabled:opacity-50"
              >
                {isProcessing ? 'Processing Supply...' : 'Securely Place Order'}
              </button>
              
              {!selectedAddress && (
                <p className="mt-3 md:mt-4 text-center text-[9px] md:text-[10px] text-amber-500 font-bold uppercase tracking-widest animate-pulse">
                  Please Select a Delivery Address
                </p>
              )}

              <div className="mt-4 md:mt-6 flex flex-col items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1.5 md:gap-2 text-[#555555]">
                  <ShieldCheck size={12} className="text-[#C9A84C]" />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">ID Verified at Door</span>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="esewa" className="h-3 md:h-4 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all" />
                  <img src="https://khalti.com/static/khalti-logo.png" alt="khalti" className="h-3 md:h-4 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all ml-2" />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* MOBILE STICKY CTA — keeps the total & place-order action reachable
          without scrolling past address/payment/notes on small screens.
          Desktop already has this covered via the sticky right sidebar. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#16110F]/95 backdrop-blur-md px-3 md:px-4 py-2.5 md:py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] lg:hidden">
        <div className="flex items-center justify-between gap-3 md:gap-4">
          <div className="min-w-0">
            <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-[#888888]">Total Payable</p>
            <p className="truncate text-[16px] md:text-[18px] font-mono font-bold text-[#C9A84C]">Rs {total.toLocaleString()}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={!selectedAddress || isProcessing}
            className="flex h-10 md:h-12 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C] px-4 md:px-6 text-[11px] md:text-[12px] font-black uppercase tracking-widest text-black transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Place Order'}
          </button>
        </div>
        {!selectedAddress && (
          <p className="mt-1 md:mt-1.5 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-amber-500">
            Select a delivery address
          </p>
        )}
      </div>
    </div>
  );
}