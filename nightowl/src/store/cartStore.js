import { create } from 'zustand';
import { POINTS_TO_RUPEE } from '@/store/loyaltyStore';
import { validateCoupon } from '@/lib/backendAPI';

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem('jhyaap_cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items) => {
  localStorage.setItem('jhyaap_cart', JSON.stringify(items));
};



export const useCartStore = create((set, get) => ({
  items: loadCartFromStorage(),
  couponCode: null,
  couponDiscount: 0,
  pointsToRedeem: 0,

  addItem: (product) => {
    set((state) => {
      const existing = state.items.find((item) => item.product.id === product.id);
      let updated;
      if (existing) {
        updated = state.items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updated = [...state.items, { product, quantity: 1 }];
      }
      saveCartToStorage(updated);
      return { items: updated };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const updated = state.items.filter((item) => item.product.id !== productId);
      saveCartToStorage(updated);
      return { items: updated };
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => {
      const updated = state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      saveCartToStorage(updated);
      return { items: updated };
    });
  },

  clearCart: () => {
    saveCartToStorage([]);
    set({ items: [], couponCode: null, couponDiscount: 0, pointsToRedeem: 0 });
  },

  applyCoupon: async (code) => {
    const normalizedCode = String(code || '').trim().toUpperCase();
    if (!normalizedCode) return { success: false, message: 'Enter a coupon code.' };
    try {
      const result = await validateCoupon(normalizedCode, get().getTotalPrice());
      if (!result.valid) return { success: false, message: result.message || 'Coupon is not valid.' };
      set({ couponCode: normalizedCode, couponDiscount: Number(result.discount_amount || 0) });
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: error.message || 'Unable to validate coupon.' };
    }
  },
  removeCoupon: () => {
    set({ couponCode: null, couponDiscount: 0 });
  },

  setPointsToRedeem: (points) => {
    set({ pointsToRedeem: Math.max(0, points) });
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  },

  getDiscount: () => {
    const subtotal = get().getTotalPrice();
    return subtotal > 5000 ? Math.floor(subtotal * 0.1) : 0;
  },

  getCouponDiscount: () => Number(get().couponDiscount || 0),

  getPointsDiscount: () => {
    return Math.floor(get().pointsToRedeem / POINTS_TO_RUPEE);
  },

  getDeliveryFee: (distanceKm = 0) => {
    // Distance-based delivery: 100 NPR base + 30 NPR/km after 3km
    if (distanceKm <= 3) {
      return 100;
    }
    return 100 + Math.ceil(distanceKm - 3) * 30;
  },

  getFinalTotal: (distanceKm = 0) => {
    return Math.max(
      0,
      get().getTotalPrice() -
        get().getDiscount() -
        get().getCouponDiscount() -
        get().getPointsDiscount() +
        get().getDeliveryFee(distanceKm)
    );
  },
  getItemQuantity: (productId) => {
    const item = get().items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  },
}));



