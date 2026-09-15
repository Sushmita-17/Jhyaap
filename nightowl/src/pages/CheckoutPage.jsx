import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, MapPin, Plus, ShieldCheck, Sparkles, Navigation, Map, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useCustomerStore } from '@/store/customerStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useThemeStore } from '@/store/themeStore';
import { DELIVERY_AREAS } from '@/data/deliveryAreas';
import {
  useLoyaltyStore,
  MIN_REDEEM_POINTS,
  POINTS_TO_RUPEE,
  POINTS_PER_100_RS,
} from '@/store/loyaltyStore';
import { uploadPaymentScreenshot } from '@/lib/backendAPI';
import { parseCoordinatesFromUrl, getCurrentGPSLocation, generateOSMUrl, calculateDistance } from '@/lib/locationUtils';
import LocationMapModal from '@/components/LocationMapModal';

// Store location coordinates (Jhyaap Station)
const STORE_LOCATION = { lat: 27.7074359, lng: 85.2853747 };

const paymentMethods = [
  { id: 'cod', label: 'Cash on Delivery', detail: 'Pay when your order arrives' },
  { id: 'esewa', label: 'eSewa', detail: 'Digital wallet payment' },
  { id: 'khalti', label: 'Khalti', detail: 'Fast mobile wallet checkout' },
  { id: 'fonepay', label: 'Fonepay', detail: 'Scan to pay via Fonepay' },
];

function CheckoutEmptyState({ message, actionLabel, onAction }) {
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
  const { addresses, addAddress, deleteAddress } = useCustomerStore();
  const { createOrder } = useOrdersStore();
  const { user } = useAuthStore();
  const { setPage } = useAppStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const { getPoints, maxRedeemablePoints, pointsToRupees } = useLoyaltyStore();

  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(addresses.length === 0);
  const [newAddress, setNewAddress] = useState({ label: '', area: '', street: '', landmark: '', locationUrl: '', lat: null, lng: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Check if selected address has valid GPS coordinates
  const hasValidCoordinates = selectedAddress && 
    selectedAddress.lat && 
    selectedAddress.lng && 
    !isNaN(selectedAddress.lat) && 
    !isNaN(selectedAddress.lng);

  useEffect(() => {
    if (!selectedAddressId && addresses[0]) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const handleAddAddress = (e) => {
    e.preventDefault();
    // Allow saving with or without GPS coordinates
    // If no GPS, will use approximate location for delivery fee
    const saved = addAddress({
      ...newAddress,
      ...parseCoordinatesFromUrl(newAddress.locationUrl),
      isDefault: addresses.length === 0,
    });
    setSelectedAddressId(saved.id);
    setNewAddress({ label: '', area: '', street: '', landmark: '', locationUrl: '', lat: null, lng: null });
    setShowAddForm(false);
  };

  const handleGPSLocation = async () => {
    try {
      const location = await getCurrentGPSLocation();
      setNewAddress((current) => ({ 
        ...current, 
        lat: location.lat, 
        lng: location.lng,
        locationUrl: generateOSMUrl(location.lat, location.lng)
      }));
    } catch (error) {
      alert(error.message || 'Unable to get GPS location');
    }
  };

  const handleMapLocationSelect = (lat, lng, address = '') => {
    setNewAddress((current) => ({ 
      ...current, 
      lat, 
      lng,
      locationUrl: generateOSMUrl(lat, lng),
      fullAddress: address,
      // If address is provided and street is empty, try to extract from address
      street: current.street || (address ? address.split(',')[0] : current.street),
    }));
  };

  const handleLocationUrlChange = (e) => {
    const url = e.target.value;
    setNewAddress({ 
      ...newAddress, 
      locationUrl: url,
      ...parseCoordinatesFromUrl(url)
    });
  };

  const handleViewAddressOnMap = (address) => {
    if (address.lat && address.lng) {
      setMapModalOpen(true);
      setNewAddress({
        label: address.label,
        area: address.area,
        street: address.street,
        landmark: address.landmark || '',
        locationUrl: address.locationUrl || generateOSMUrl(address.lat, address.lng),
        lat: address.lat,
        lng: address.lng,
      });
    } else if (address.locationUrl) {
      const coords = parseCoordinatesFromUrl(address.locationUrl);
      if (coords.lat && coords.lng) {
        setMapModalOpen(true);
        setNewAddress({
          label: address.label,
          area: address.area,
          street: address.street,
          landmark: address.landmark || '',
          locationUrl: address.locationUrl,
          lat: coords.lat,
          lng: coords.lng,
        });
      } else {
        window.open(address.locationUrl, '_blank');
      }
    } else {
      alert('No location coordinates saved for this address');
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    const result = await applyCoupon(couponInput);
    if (result.success) setCouponInput('');
    else setCouponError(result.message);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Screenshot must be less than 5MB');
        return;
      }
      setPaymentScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !user) return;
    if ((paymentMethod === 'esewa' || paymentMethod === 'khalti' || paymentMethod === 'fonepay') && !paymentScreenshot) {
      alert('Please upload a payment screenshot for verification');
      return;
    }

    setIsProcessing(true);
    
    let screenshotUrl = null;
    if (paymentScreenshot && (paymentMethod === 'esewa' || paymentMethod === 'khalti' || paymentMethod === 'fonepay')) {
      try {
        const uploadResult = await uploadPaymentScreenshot(paymentScreenshot);
        screenshotUrl = uploadResult.path || uploadResult.url;
      } catch (error) {
        alert('Failed to upload payment screenshot. Please try again.');
        setIsProcessing(false);
        return;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const order = await createOrder(
      items,
      selectedAddress,
      paymentMethod,
      getDiscount() + getCouponDiscount() + getPointsDiscount(),
      user.id,
      pointsToRedeem,
      notes,
      couponCode,
      screenshotUrl,
      user.phone
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
  
  // Calculate distance and delivery fee based on selected address
  let distanceKm = 0;
  if (selectedAddress && selectedAddress.lat && selectedAddress.lng && !isNaN(selectedAddress.lat) && !isNaN(selectedAddress.lng)) {
    // Calculate straight-line distance using Haversine formula
    const straightLineDistance = calculateDistance(STORE_LOCATION.lat, STORE_LOCATION.lng, selectedAddress.lat, selectedAddress.lng);
    // Convert to approximate road distance (multiply by 5.4 for Kathmandu urban area)
    // Multiplier calibrated to match Google Maps road distance (7.2km vs 1.34km straight-line = 5.37x)
    distanceKm = straightLineDistance * 5.4;
  } else {
    console.warn('Selected address missing valid GPS coordinates, using default distance');
  }
  
  // If no valid GPS coordinates, default to 3km distance (Rs 100 delivery fee)
  const effectiveDistance = distanceKm > 0 ? distanceKm : 3;
  const deliveryFee = getDeliveryFee(effectiveDistance);
  const total = getFinalTotal(effectiveDistance);

  // Log for debugging
  console.log('Store Location:', STORE_LOCATION);
  console.log('Selected Address:', selectedAddress);
  console.log('Address coordinates:', selectedAddress?.lat, selectedAddress?.lng);
  console.log('Straight-line Distance:', (distanceKm / 5.4).toFixed(2), 'km');
  console.log('Road Distance (approx):', distanceKm.toFixed(2), 'km');
  console.log('Effective Distance:', effectiveDistance.toFixed(2), 'km');
  console.log('Delivery Fee: Rs', deliveryFee);
  
  const loyaltyBalance = user ? getPoints(user.id) : 0;
  const maxPoints = user ? maxRedeemablePoints(user.id, subtotal) : 0;
  const estimatedEarn = Math.floor(total / 100) * POINTS_PER_100_RS;

  return (
    <div className={`min-h-screen pb-32 lg:pb-20 selection:bg-[#C9A84C]/30 ${
      isLight ? 'bg-gray-50' : 'bg-[#0D0908]'
    }`}>
      {/* Page Header */}
      <div className="max-w-[1248px] mx-auto px-3 md:px-4 py-4 md:py-8">
        <button
          onClick={() => setPage('cart')}
          className={`group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3 transition-colors ${
            isLight ? 'text-gray-500 hover:text-gray-900' : 'text-[#888888] hover:text-[#C9A84C]'
          }`}
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Cart
        </button>
        <h1 className={`text-[24px] md:text-[32px] font-serif font-bold ${
          isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
        }`}>Checkout</h1>
        <p className={`text-xs md:text-sm mt-0.5 md:mt-1 ${
          isLight ? 'text-gray-600' : 'text-[#888888]'
        }`}>Confirm your details to finalize the night's supply.</p>
      </div>

      <div className="max-w-[1248px] mx-auto px-3 md:px-4 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 md:gap-8">
        
        {/* LEFT: DELIVERY & PAYMENT DETAILS */}
        <div className="space-y-4 md:space-y-6">
          
          {/* Delivery Address Section */}
          <section className={`border rounded-[16px] md:rounded-[24px] p-4 md:p-6 shadow-xl ${
            isLight ? 'bg-white border-gray-200' : 'bg-[#16110F] border-white/5'
          }`}>
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <MapPin className={`h-4 w-4 md:h-5 md:w-5 ${isLight ? 'text-gray-600' : 'text-[#C9A84C]'}`} />
              <h2 className={`text-[12px] md:text-[14px] font-black uppercase tracking-widest ${
                isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
              }`}>Delivery address</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-2 md:gap-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`relative flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedAddressId === addr.id 
                    ? 'bg-[#C9A84C]/10 border-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.1)]' 
                    : isLight 
                      ? 'bg-gray-50 border-gray-200 hover:border-gray-300' 
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
                      <p className={`font-bold text-xs md:text-sm ${
                        isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                      }`}>{addr.label}</p>
                      {addr.isDefault && <span className="bg-[#C9A84C]/20 text-[#C9A84C] text-[8px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-full uppercase">Default</span>}
                    </div>
                    <p className={`mt-0.5 md:mt-1 text-xs md:text-sm ${
                      isLight ? 'text-gray-600' : 'text-[#888888]'
                    }`}>
                      {addr.street || addr.fullAddress || 'Location selected'}
                    </p>
                    {addr.landmark && <p className={`text-[10px] md:text-[11px] mt-0.5 italic ${
                      isLight ? 'text-gray-500' : 'text-[#555555]'
                    }`}>{addr.landmark}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {addr.lat && addr.lng ? (() => {
                      const addrDistance = calculateDistance(STORE_LOCATION.lat, STORE_LOCATION.lng, addr.lat, addr.lng);
                      const addrDeliveryFee = addrDistance <= 3 ? 100 : 100 + Math.ceil(addrDistance - 3) * 30;
                      return (
                        <>
                          <span className="text-[9px] md:text-[10px] font-mono text-gray-500">{addrDistance.toFixed(1)} km</span>
                          <span className="text-[10px] md:text-[11px] font-mono font-bold text-[#C9A84C]">Rs {addrDeliveryFee}</span>
                        </>
                      );
                    })() : (
                      <span className="text-[10px] md:text-[11px] font-mono font-bold text-[#C9A84C]">Rs 100</span>
                    )}
                    <div className="flex items-center gap-2">
                      {(addr.lat && addr.lng || addr.locationUrl) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAddressOnMap(addr);
                          }}
                          className={`text-[9px] md:text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                            isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
                          }`}
                        >
                          <Map className="h-3 w-3" />
                          View Map
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to remove this address?')) {
                            deleteAddress(addr.id);
                            if (selectedAddressId === addr.id) {
                              setSelectedAddressId(null);
                            }
                          }
                        }}
                        className={`text-[9px] md:text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                          isLight ? 'text-red-600 hover:text-red-700' : 'text-red-400 hover:text-red-300'
                        }`}
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {!hasValidCoordinates && selectedAddress && (
              <div className={`mb-3 rounded-xl border px-3 py-2 text-xs font-medium ${
                isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}>
                ℹ️ Using approximate location for delivery fee. For accurate pricing, edit this address and select location using GPS or Map.
              </div>
            )}

            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className={`mt-4 md:mt-6 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed py-3 md:py-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${
                  isLight 
                    ? 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700' 
                    : 'border-white/10 text-[#888888] hover:border-[#C9A84C]/40 hover:text-[#C9A84C]'
                }`}
              >
                <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Add New Delivery Destination
              </button>
            ) : (
              <div className={`mt-4 md:mt-6 border rounded-2xl p-4 md:p-6 ${
                isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/20 border-white/5'
              }`}>
                <h3 className={`text-[11px] md:text-[12px] font-black uppercase tracking-widest mb-3 md:mb-4 ${
                  isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                }`}>Select Delivery Location</h3>
                <form onSubmit={handleAddAddress} className="space-y-3 md:space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="url"
                      placeholder="Google/OSM map link (optional)"
                      value={newAddress.locationUrl}
                      onChange={handleLocationUrlChange}
                      className={`min-w-0 flex-1 border rounded-xl px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:border-[#C9A84C] transition-colors ${
                        isLight 
                          ? 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400' 
                          : 'bg-black/30 border-white/10 text-white placeholder:text-gray-500'
                      }`}
                    />
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={handleGPSLocation}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
                          newAddress.lat && newAddress.lng
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : isLight
                              ? 'bg-[#C9A84C] text-black hover:bg-[#b5953e] shadow-[0_2px_10px_rgba(201,168,76,0.3)]'
                              : 'bg-[#C9A84C] text-black hover:bg-[#e0bb56] shadow-[0_2px_15px_rgba(201,168,76,0.2)]'
                        }`}
                      >
                        <Navigation className={`w-4 h-4 ${newAddress.lat ? 'animate-bounce' : ''}`} />
                        {newAddress.lat && newAddress.lng ? 'GPS ✓' : 'GPS'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapModalOpen(true)}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
                          isLight
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_2px_10px_rgba(37,99,235,0.3)]'
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_2px_15px_rgba(37,99,235,0.2)]'
                        }`}
                      >
                        <Map className="w-4 h-4" />
                        Map
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Nearby Landmark (House color, shop name...)"
                    value={newAddress.landmark}
                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                    className={`w-full border rounded-xl px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:border-[#C9A84C] transition-colors ${
                      isLight 
                        ? 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400' 
                        : 'bg-black/30 border-white/10 text-white placeholder:text-gray-500'
                    }`}
                  />
                  <div className="flex gap-2 md:gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-[#C9A84C] text-black py-2 md:py-3 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-white transition-all">
                      Save & Select
                    </button>
                    <button type="button" onClick={() => setShowAddForm(false)} className={`flex-1 py-2 md:py-3 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all ${
                      isLight 
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                        : 'bg-white/5 text-[#888888] hover:bg-white/10'
                    }`}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>

          {/* Payment Method Section */}
          <section className={`border rounded-[16px] md:rounded-[24px] p-4 md:p-6 shadow-xl ${
            isLight ? 'bg-white border-gray-200' : 'bg-[#16110F] border-white/5'
          }`}>
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <CreditCard className={`h-4 w-4 md:h-5 md:w-5 ${isLight ? 'text-gray-600' : 'text-[#C9A84C]'}`} />
              <h2 className={`text-[12px] md:text-[14px] font-black uppercase tracking-widest ${
                isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
              }`}>Payment method</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`relative flex flex-col items-center text-center p-3 md:p-5 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === method.id 
                    ? 'bg-[#C9A84C]/10 border-[#C9A84C] shadow-[0_0_15px_rgba(201,168,76,0.1)]' 
                    : isLight 
                      ? 'bg-gray-50 border-gray-200 hover:border-gray-300' 
                      : 'bg-black/20 border-white/5 hover:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="absolute top-3 md:top-4 right-3 md:right-4 accent-[#C9A84C]"
                  />
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 md:mb-3 border ${
                    isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#16110F] border-white/5'
                  }`}>
                    <CreditCard className={`w-4 h-4 md:w-5 md:h-5 ${paymentMethod === method.id ? 'text-[#C9A84C]' : isLight ? 'text-gray-400' : 'text-[#888888]'}`} />
                  </div>
                  <p className={`font-bold text-[11px] md:text-[13px] ${
                    isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                  }`}>{method.label}</p>
                  <p className={`text-[9px] md:text-[10px] mt-0.5 md:mt-1 ${
                    isLight ? 'text-gray-500' : 'text-[#555555]'
                  }`}>{method.detail}</p>
                </label>
              ))}
            </div>

            {(paymentMethod === 'esewa' || paymentMethod === 'khalti' || paymentMethod === 'fonepay') && (
              <div className={`mt-4 md:mt-6 border rounded-2xl p-4 md:p-6 ${
                isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/20 border-white/5'
              }`}>
                <h3 className={`text-[11px] md:text-[12px] font-black uppercase tracking-widest mb-3 md:mb-4 ${
                  isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                }`}>Payment Screenshot</h3>
                <p className={`text-[10px] md:text-[11px] mb-3 md:mb-4 ${
                  isLight ? 'text-gray-600' : 'text-[#888888]'
                }`}>
                  Please upload a screenshot of your {paymentMethod === 'esewa' ? 'eSewa' : paymentMethod === 'khalti' ? 'Khalti' : 'Fonepay'} payment for verification.
                </p>
                
                {screenshotPreview ? (
                  <div className="relative mb-3">
                    <img 
                      src={screenshotPreview} 
                      alt="Payment screenshot" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentScreenshot(null);
                        setScreenshotPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 md:p-8 cursor-pointer transition-colors ${
                    isLight 
                      ? 'border-gray-300 hover:border-[#C9A84C] bg-gray-50' 
                      : 'border-white/10 hover:border-[#C9A84C] bg-black/20'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                    <div className={`text-center ${
                      isLight ? 'text-gray-600' : 'text-[#888888]'
                    }`}>
                      <p className={`text-[11px] md:text-[12px] font-bold mb-1 ${
                        isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                      }`}>Click to upload screenshot</p>
                      <p className="text-[9px] md:text-[10px]">PNG, JPG up to 5MB</p>
                    </div>
                  </label>
                )}
              </div>
            )}
          </section>

          {/* Notes Section */}
          <section className={`border rounded-[16px] md:rounded-[24px] p-4 md:p-6 shadow-xl ${
            isLight ? 'bg-white border-gray-200' : 'bg-[#16110F] border-white/5'
          }`}>
            <h2 className={`text-[12px] md:text-[14px] font-black uppercase tracking-widest mb-3 md:mb-4 ${
              isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
            }`}>Special instructions</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Ring the bell twice, leave with the guard, or call me upon arrival..."
              className={`w-full border rounded-2xl p-3 md:p-4 text-xs md:text-sm focus:outline-none focus:border-[#C9A84C] transition-colors h-24 md:h-28 resize-none shadow-inner ${
                isLight 
                  ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400' 
                  : 'bg-black/20 border-white/10 text-white placeholder:text-gray-500'
              }`}
            />
          </section>
        </div>

        {/* RIGHT: BILLING / ORDER SUMMARY */}
        <aside className="space-y-4 md:space-y-6 lg:sticky lg:top-[120px] lg:self-start">
          
          {/* LOYALTY CARD */}
          <div className={`border rounded-[16px] md:rounded-[24px] p-4 md:p-6 shadow-2xl relative overflow-hidden group ${
            isLight ? 'bg-white border-gray-200' : 'bg-[#1C1513] border-[#C9A84C]/20'
          }`}>
            <div className={`absolute -right-4 -top-4 w-20 h-20 md:w-24 md:h-24 rounded-full blur-3xl group-hover:bg-[#C9A84C]/10 transition-all duration-500 ${
              isLight ? 'bg-gray-200' : 'bg-[#C9A84C]/5'
            }`} />
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <Sparkles className={`h-4 w-4 md:h-5 md:w-5 ${isLight ? 'text-gray-600' : 'text-[#C9A84C]'}`} />
              <h2 className={`text-[11px] md:text-[12px] font-black uppercase tracking-widest ${
                isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
              }`}>Loyalty Rewards</h2>
            </div>
            
            <div className={`rounded-2xl p-3 md:p-4 border ${
              isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/40 border-white/5'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-[10px] md:text-[11px] ${
                  isLight ? 'text-gray-600' : 'text-[#888888]'
                }`}>Available Balance</span>
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
                    <span className={`text-[9px] md:text-[10px] font-bold ${
                      isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                    }`}>Redeem {pointsToRedeem} pts</span>
                    <span className="text-green-500 font-mono font-bold text-xs md:text-sm">-Rs {pointsDiscount}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPointsToRedeem(maxPoints)}
                    className={`w-full py-1.5 md:py-2 border rounded-lg text-[9px] md:text-[10px] font-black uppercase transition-all ${
                      isLight 
                        ? 'border-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C]/10' 
                        : 'border-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C]/10'
                    }`}
                  >
                    Use Max Points
                  </button>
                </div>
              ) : (
                <p className={`text-[9px] md:text-[10px] italic leading-relaxed ${
                  isLight ? 'text-gray-500' : 'text-[#555555]'
                }`}>
                  Need {MIN_REDEEM_POINTS} pts to start redeeming. You earn points on every sip!
                </p>
              )}
            </div>
            
            {estimatedEarn > 0 && (
              <p className={`mt-3 md:mt-4 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${
                isLight ? 'text-gray-600' : 'text-[#888888]'
              }`}>
                You'll earn <span className="text-[#C9A84C]">~{estimatedEarn} pts</span> today
              </p>
            )}
          </div>

          {/* FINAL BILL / RECEIPT STYLE */}
          <div className={`border rounded-[16px] md:rounded-[24px] overflow-hidden shadow-2xl ${
            isLight ? 'bg-white border-gray-200' : 'bg-[#16110F] border-white/5'
          }`}>
            <div className={`px-4 md:px-6 py-3 md:py-5 border-b ${
              isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#1E1614] border-white/5'
            }`}>
              <h2 className={`text-[12px] md:text-[14px] font-black uppercase tracking-widest text-[#C9A84C]`}>Order Summary</h2>
            </div>
            
            {/* The Items List (Receipt Body) */}
            <div className="px-4 md:px-6 py-4 md:py-6 pb-2">
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-start gap-2 md:gap-3 group">
                    <div className="min-w-0">
                      <p className={`text-[11px] md:text-[13px] font-bold truncate leading-tight ${
                        isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                      }`}>{item.product.name}</p>
                      <p className={`text-[10px] md:text-[11px] mt-0.5 ${
                        isLight ? 'text-gray-500' : 'text-[#555555]'
                      }`}>{item.quantity} &times; Rs {item.product.price.toLocaleString()}</p>
                    </div>
                    <span className={`shrink-0 font-mono text-[11px] md:text-[13px] font-bold ${
                      isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                    }`}>Rs {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totals Calculation */}
              <div className={`space-y-2 md:space-y-3 pt-4 md:pt-6 border-t border-dashed ${
                isLight ? 'border-gray-200' : 'border-white/10'
              }`}>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className={isLight ? 'text-gray-600' : 'text-[#888888]'}>Subtotal</span>
                  <span className={`font-mono font-bold ${
                    isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                  }`}>Rs {subtotal.toLocaleString()}</span>
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
                  <span className={isLight ? 'text-gray-600' : 'text-[#888888]'}>Delivery Fee</span>
                  <div className="text-right">
                    <span className={`text-[9px] md:text-[10px] font-mono ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>
                      {effectiveDistance.toFixed(1)} km
                    </span>
                    <span className={`font-mono font-bold block ${
                      isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                    }`}>
                      Rs {deliveryFee.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className={`rounded-2xl p-3 md:p-5 mt-4 md:mt-6 border relative overflow-hidden ${
                  isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/30 border-white/5'
                }`}>
                  <div className="absolute left-0 top-0 w-1 h-full bg-[#C9A84C]" />
                  <div className="flex flex-col">
                    <span className={`text-[9px] md:text-[10px] font-black tracking-[4px] uppercase mb-0.5 md:mb-1 ${
                      isLight ? 'text-gray-600' : 'text-[#888888]'
                    }`}>Total Payable</span>
                    <div className="flex items-baseline gap-1.5 md:gap-2">
                      <span className={`text-[11px] md:text-[12px] font-mono ${
                        isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                      }`}>Rs.</span>
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
                className="w-full bg-[#C9A84C] text-black h-[52px] md:h-[64px] rounded-2xl flex items-center justify-center font-black uppercase tracking-[2px] text-[11px] md:text-[13px] hover:bg-[#E5B860] active:scale-95 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Processing Supply...' : 'Securely Place Order'}
              </button>
              
              {!selectedAddress && (
                <p className="mt-3 md:mt-4 text-center text-[9px] md:text-[10px] text-amber-500 font-bold uppercase tracking-widest animate-pulse">
                  Please Select a Delivery Address
                </p>
              )}

              <div className="mt-4 md:mt-6 flex flex-col items-center gap-2 md:gap-3">
                <div className={`flex items-center gap-1.5 md:gap-2 ${
                  isLight ? 'text-gray-500' : 'text-[#555555]'
                }`}>
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

      {/* Location Map Modal */}
      <LocationMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        initialLat={newAddress.lat}
        initialLng={newAddress.lng}
        onLocationSelect={handleMapLocationSelect}
        isLight={isLight}
      />

      {/* MOBILE STICKY CTA */}
      <div className={`fixed inset-x-0 bottom-0 z-40 border-t px-3 md:px-4 py-2.5 md:py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] lg:hidden backdrop-blur-md ${
        isLight 
          ? 'bg-white/95 border-gray-200 shadow-[0_-8px_24px_rgba(0,0,0,0.1)]' 
          : 'bg-[#16110F]/95 border-white/10'
      }`}>
        <div className="flex items-center justify-between gap-3 md:gap-4">
          <div className="min-w-0">
            <p className={`text-[8px] md:text-[9px] uppercase tracking-widest ${
              isLight ? 'text-gray-600' : 'text-[#888888]'
            }`}>Total Payable</p>
            <p className="truncate text-[16px] md:text-[18px] font-mono font-bold text-[#C9A84C]">Rs {total.toLocaleString()}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={!selectedAddress || isProcessing}
            className="flex h-10 md:h-12 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C] text-black px-4 md:px-6 text-[11px] md:text-[12px] font-black uppercase tracking-widest hover:bg-[#E5B860] active:scale-95 transition-all disabled:opacity-50"
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
