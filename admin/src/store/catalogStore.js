import baseCatalog from '@/data/cheers-catalog.json';
import {
    buildCategories,
    DEFAULT_BANNERS,
    generateId,
    slugify,
} from '@/lib/catalogUtils';
// Type imports removed - these are JSDoc type definitions only, not actual exports
import { create } from 'zustand';

const PRODUCTS_KEY = 'nightowl_products';
const CATEGORIES_KEY = 'nightowl_custom_categories';
const BANNERS_KEY = 'nightowl_banners_v10';
const TRENDING_KEY = 'nightowl_trending_products';
const FLASH_SALE_KEY = 'nightowl_flash_sale_products';

const API_PRODUCTS_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001') + '/api/v1/products';
const USE_LOCAL_DATA_ONLY = import.meta.env.VITE_USE_LOCAL_DATA_ONLY === 'true';
const adminHeaders = () => {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('nightowl_admin_token') : null;
  return token ? { Authorization: 'Bearer ' + token } : {};
};

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadInitialBanners() {
  const loaded = loadJson(BANNERS_KEY, DEFAULT_BANNERS);
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

export const useCatalogStore = create((set, get) => ({
  products: [],
  customCategories: loadJson(CATEGORIES_KEY, []),
  banners: loadInitialBanners(),
  isLoading: false,
  trendingProductIds: loadJson(TRENDING_KEY, []),
  flashSaleProductIds: loadJson(FLASH_SALE_KEY, []),

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      if (USE_LOCAL_DATA_ONLY) {
        throw new Error('Using local data only');
      }
      const response = await fetch(API_PRODUCTS_URL);
      if (!response.ok) throw new Error('API server unavailable');
      const products = await response.json();
      set({ products });
      saveJson(PRODUCTS_KEY, products); // Backup local sync
    } catch (e) {
      // Use local data only mode or fallback
      const localProducts = loadJson(PRODUCTS_KEY, baseCatalog);
      set({ products: localProducts });
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (input) => {
    const id = input.id ?? `p_${slugify(input.name)}_${Date.now().toString(36)}`;
    const product = { ...input, id };

    try {
      const response = await fetch(API_PRODUCTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error("Could not insert product to backend");
      const saved = await response.json();

      set((state) => {
        const products = [...state.products, saved];
        saveJson(PRODUCTS_KEY, products);
        return { products };
      });
      return saved;
    } catch (e) {
      console.error(e);
      // Fallback local save in dev
      set((state) => {
        const products = [...state.products, product];
        saveJson(PRODUCTS_KEY, products);
        return { products };
      });
      return product;
    }
  },

  updateProduct: async (id, updates) => {
    // Optimistic Update
    set((state) => {
      const products = state.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
      saveJson(PRODUCTS_KEY, products);
      return { products };
    });

    try {
      const existing = get().products.find(p => p.id === id);
      if (!existing) return;
      const response = await fetch(`${API_PRODUCTS_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify(existing),
      });
      if (!response.ok) throw new Error("Could not update product in backend");
    } catch (e) {
      console.error("Backend product sync update failed:", e);
    }
  },

  deleteProduct: async (id) => {
    set((state) => {
      const products = state.products.filter((p) => p.id !== id);
      saveJson(PRODUCTS_KEY, products);
      return { products };
    });

    try {
      const response = await fetch(`${API_PRODUCTS_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Could not remove product from backend");
    } catch (e) {
      console.error("Backend product removal failed:", e);
    }
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
    const banner = { ...input, id: input.id ?? generateId('banner') };
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

  resetCatalog: async () => {
    try {
      // Re-seed from base fallback in local SQLite database by resetting individual records
      const initial = baseCatalog;
      for (const p of initial) {
        await fetch(API_PRODUCTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...adminHeaders() },
          body: JSON.stringify(p),
        });
      }
    } catch (e) {
      console.warn("API Re-seed error:", e);
    }
    const products = baseCatalog;
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

  setTrendingProducts: (ids) => {
    saveJson(TRENDING_KEY, ids);
    set({ trendingProductIds: ids });
  },

  setFlashSaleProducts: (ids) => {
    saveJson(FLASH_SALE_KEY, ids);
    set({ flashSaleProductIds: ids });
  },

  getTrendingProducts: () => {
    const { products, trendingProductIds } = get();
    if (trendingProductIds.length === 0) {
      return [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 6);
    }
    return products.filter(p => trendingProductIds.includes(p.id));
  },

  getFlashSaleProducts: () => {
    const { products, flashSaleProductIds } = get();
    if (flashSaleProductIds.length === 0) {
      return products.filter(p => p.badge).slice(0, 6);
    }
    return products.filter(p => flashSaleProductIds.includes(p.id));
  },
}));

export function useCategories() {
  return useCatalogStore((s) => buildCategories(s.products, s.customCategories));
}

export function getFeaturedProducts(products) {
  return products.filter((p) => p.badge).slice(0, 8);
}

export function getTrendingProducts(products) {
  return [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 6);
}


