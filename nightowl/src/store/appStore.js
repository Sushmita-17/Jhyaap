import { create } from 'zustand';

export const useAppStore = create((set) => ({
  currentPage: 'home',
  selectedProductId: null,
  searchQuery: '',
  selectedCategory: null,
  onlyDeals: false,
  postLoginPage: null,
  setPage: (page) => set({ currentPage: page }),
  setPostLoginPage: (page) => set({ postLoginPage: page }),
  setSelectedProduct: (id) => set({ selectedProductId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setOnlyDeals: (onlyDeals) => set({ onlyDeals }),
}));
