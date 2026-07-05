import { create } from 'zustand';
import { CartItem, Product } from '@/types';
import { POINTS_TO_RUPEE } from '@/store/loyaltyStore';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  pointsToRedeem: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  setPointsToRedeem: (points: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDiscount: () => number;
  getCouponDiscount: () => number;
  getPointsDiscount: () => number;
  getDeliveryFee: () => number;
  getFinalTotal: () => number;
  getItemQuantity: (productId: string) => number;
}

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem('jhyaap_cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  localStorage.setItem('jhyaap_cart', JSON.stringify(items));
};

const validCoupons: Record<string, { type: string; value: number; minOrder: number }> = {
  'JHYAAP20': { type: 'percentage', value: 20, minOrder: 500 },
  'FIRST100': { type: 'flat', value: 100, minOrder: 0 },
  'DELIVERY50': { type: 'percentage', value: 50, minOrder: 1000 },
};

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCartFromStorage(),
  couponCode: null,
  pointsToRedeem: 0,

  addItem: (product: Product) => {
    set((state) => {
      const existing = state.items.find((item) => item.product.id === product.id);
      let updated: CartItem[];
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

  removeItem: (productId: string) => {
    set((state) => {
      const updated = state.items.filter((item) => item.product.id !== productId);
      saveCartToStorage(updated);
      return { items: updated };
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
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
    set({ items: [], couponCode: null, pointsToRedeem: 0 });
  },

  applyCoupon: (code: string) => {
    const coupon = validCoupons[code.toUpperCase()];
    if (!coupon) return false;
    
    const subtotal = get().getTotalPrice();
    if (subtotal < coupon.minOrder) return false;
    
    set({ couponCode: code.toUpperCase() });
    return true;
  },

  removeCoupon: () => {
    set({ couponCode: null });
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

  getCouponDiscount: () => {
    const code = get().couponCode;
    if (!code) return 0;

    const coupon = validCoupons[code];
    if (!coupon) return 0;

    const subtotal = get().getTotalPrice();
    if (coupon.type === 'percentage') {
      return Math.floor((subtotal * coupon.value) / 100);
    } else {
      return coupon.value;
    }
  },

  getPointsDiscount: () => {
    return Math.floor(get().pointsToRedeem / POINTS_TO_RUPEE);
  },

  getDeliveryFee: () => {
    const subtotal = get().getTotalPrice();
    return subtotal > 3000 ? 0 : 150;
  },

  getFinalTotal: () => {
    return Math.max(
      0,
      get().getTotalPrice() -
        get().getDiscount() -
        get().getCouponDiscount() -
        get().getPointsDiscount() +
        get().getDeliveryFee()
    );
  },
  getItemQuantity: (productId: string) => {
    const item = get().items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  },
}));
