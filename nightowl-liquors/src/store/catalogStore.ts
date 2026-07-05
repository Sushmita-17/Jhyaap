import baseCatalog from '@/data/cheers-catalog.json';
import {
    buildCategories,
    CustomCategory,
    DEFAULT_BANNERS,
    generateId,
    slugify,
} from '@/lib/catalogUtils';
import { BannerSlide, Product } from '@/types';
import { create } from 'zustand';

const PRODUCTS_KEY = 'nightowl_products';
const CATEGORIES_KEY = 'nightowl_custom_categories';
const BANNERS_KEY = 'nightowl_banners_v10';

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadInitialProducts(): Product[] {
  return loadJson<Product[]>(PRODUCTS_KEY, baseCatalog as Product[]);
}

function loadInitialBanners(): BannerSlide[] {
  const loaded = loadJson<BannerSlide[]>(BANNERS_KEY, DEFAULT_BANNERS);
  const needsReset =
    !loaded ||
    loaded.length !== DEFAULT_BANNERS.length ||
    DEFAULT_BANNERS.some((defaultBanner, index) => {
      const existing = loaded[index];
      return (
        !existing ||
        existing.id !== defaultBanner.id ||
        existing.image !== defaultBanner.image
      );
    });

  if (needsReset) {
    saveJson(BANNERS_KEY, DEFAULT_BANNERS);
    return DEFAULT_BANNERS;
  }

  return loaded;
}

interface CatalogState {
  products: Product[];
  customCategories: CustomCategory[];
  banners: BannerSlide[];
  addProduct: (input: Omit<Product, 'id'> & { id?: string }) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: CustomCategory) => void;
  updateCategory: (id: string, updates: Partial<CustomCategory>) => void;
  deleteCategory: (id: string) => void;
  addBanner: (banner: Omit<BannerSlide, 'id'> & { id?: string }) => BannerSlide;
  updateBanner: (id: string, updates: Partial<BannerSlide>) => void;
  deleteBanner: (id: string) => void;
  resetCatalog: () => void;
  getCategories: () => ReturnType<typeof buildCategories>;
  getProductById: (id: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: loadInitialProducts(),
  customCategories: loadJson<CustomCategory[]>(CATEGORIES_KEY, []),
  banners: loadInitialBanners(),

  addProduct: (input) => {
    const id = input.id ?? `p_${slugify(input.name)}_${Date.now().toString(36)}`;
    const product: Product = { ...input, id };
    set((state) => {
      const products = [...state.products, product];
      saveJson(PRODUCTS_KEY, products);
      return { products };
    });
    return product;
  },

  updateProduct: (id, updates) => {
    set((state) => {
      const products = state.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
      saveJson(PRODUCTS_KEY, products);
      return { products };
    });
  },

  deleteProduct: (id) => {
    set((state) => {
      const products = state.products.filter((p) => p.id !== id);
      saveJson(PRODUCTS_KEY, products);
      return { products };
    });
  },

  addCategory: (category) => {
    set((state) => {
      const customCategories = [...state.customCategories.filter((c) => c.id !== category.id), category];
      saveJson(CATEGORIES_KEY, customCategories);
      return { customCategories };
    });
  },

  updateCategory: (id, updates) => {
    set((state) => {
      const customCategories = state.customCategories.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      );
      saveJson(CATEGORIES_KEY, customCategories);
      return { customCategories };
    });
  },

  deleteCategory: (id) => {
    set((state) => {
      const customCategories = state.customCategories.filter((c) => c.id !== id);
      saveJson(CATEGORIES_KEY, customCategories);
      return { customCategories };
    });
  },

  addBanner: (input) => {
    const banner: BannerSlide = { ...input, id: input.id ?? generateId('banner') };
    set((state) => {
      const banners = [...state.banners, banner];
      saveJson(BANNERS_KEY, banners);
      return { banners };
    });
    return banner;
  },

  updateBanner: (id, updates) => {
    set((state) => {
      const banners = state.banners.map((b) => (b.id === id ? { ...b, ...updates } : b));
      saveJson(BANNERS_KEY, banners);
      return { banners };
    });
  },

  deleteBanner: (id) => {
    set((state) => {
      const banners = state.banners.filter((b) => b.id !== id);
      saveJson(BANNERS_KEY, banners);
      return { banners };
    });
  },

  resetCatalog: () => {
    const products = baseCatalog as Product[];
    saveJson(PRODUCTS_KEY, products);
    saveJson(CATEGORIES_KEY, []);
    saveJson(BANNERS_KEY, DEFAULT_BANNERS);
    set({ products, customCategories: [], banners: DEFAULT_BANNERS });
  },

  getCategories: () => buildCategories(get().products, get().customCategories),

  getProductById: (id) => get().products.find((p) => p.id === id),

  searchProducts: (query) => {
    const q = query.toLowerCase();
    return get().products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  },
}));

export function useCategories() {
  return useCatalogStore((s) => buildCategories(s.products, s.customCategories));
}

export function getFeaturedProducts(products: Product[]): Product[] {
  return products.filter((p) => p.badge).slice(0, 8);
}

export function getTrendingProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 6);
}
