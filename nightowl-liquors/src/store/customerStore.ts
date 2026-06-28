import { create } from 'zustand';
import { Address, Review } from '@/types';

interface CustomerState {
  addresses: Address[];
  reviews: Review[];
  addAddress: (address: Omit<Address, 'id' | 'deliveryFee'> & { deliveryFee?: number }) => Address;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  getAddresses: () => Address[];
  getReviewsForProduct: (productId: string) => Review[];
}

const generateAddressId = () => `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateReviewId = () => `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

import { DELIVERY_FEE_BY_AREA } from '@/data/deliveryAreas';

const loadCustomerFromStorage = () => {
  try {
    const stored = localStorage.getItem('jhyaap_customer');
    return stored ? JSON.parse(stored) : { addresses: [], reviews: [] };
  } catch {
    return { addresses: [], reviews: [] };
  }
};

const saveCustomerToStorage = (data: { addresses: Address[]; reviews: Review[] }) => {
  localStorage.setItem('jhyaap_customer', JSON.stringify(data));
};

const data = loadCustomerFromStorage();

export const useCustomerStore = create<CustomerState>((set, get) => ({
  addresses: data.addresses || [],
  reviews: data.reviews || [],

  addAddress: (address) => {
    const newAddress: Address = {
      ...address,
      id: generateAddressId(),
      deliveryFee: DELIVERY_FEE_BY_AREA[address.area] || 150,
    };
    set((state) => {
      const updated = [...state.addresses, newAddress];
      saveCustomerToStorage({ ...get(), addresses: updated });
      return { addresses: updated };
    });
    return newAddress;
  },

  updateAddress: (id, updates) => {
    set((state) => {
      const updated = state.addresses.map((addr) =>
        addr.id === id ? { ...addr, ...updates } : addr
      );
      saveCustomerToStorage({ ...get(), addresses: updated });
      return { addresses: updated };
    });
  },

  deleteAddress: (id) => {
    set((state) => {
      const updated = state.addresses.filter((addr) => addr.id !== id);
      saveCustomerToStorage({ ...get(), addresses: updated });
      return { addresses: updated };
    });
  },

  setDefaultAddress: (id) => {
    set((state) => {
      const updated = state.addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }));
      saveCustomerToStorage({ ...get(), addresses: updated });
      return { addresses: updated };
    });
  },

  addReview: (review) => {
    const newReview: Review = {
      ...review,
      id: generateReviewId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [...state.reviews, newReview];
      saveCustomerToStorage({ addresses: state.addresses, reviews: updated });
      return { reviews: updated };
    });
  },

  getAddresses: () => get().addresses,

  getReviewsForProduct: (productId) =>
    get().reviews.filter((r) => r.productId === productId),
}));
