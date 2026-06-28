import { create } from 'zustand';
import { Page } from '@/types';

interface AppState {
  currentPage: Page;
  selectedProductId: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  onlyDeals: boolean;
  postLoginPage: Page | null;
  setPage: (page: Page) => void;
  setPostLoginPage: (page: Page | null) => void;
  setSelectedProduct: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setOnlyDeals: (onlyDeals: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
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