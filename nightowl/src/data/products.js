// Product data - products will be loaded from backend API
// Categories structure for UI reference

export const categories = [
  {
    "id": "whiskey",
    "name": "Whiskey",
    "icon": "Wine",
    "color": "#c4841a",
    "image": "https://images.unsplash.com/photo-1527281400683-1ae2225f9e8e?w=300&h=300&fit=crop",
    "count": 0
  },
  {
    "id": "beer",
    "name": "Beer & Cider",
    "icon": "Beer",
    "color": "#f59e0b",
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&h=300&fit=crop",
    "count": 0
  },
  {
    "id": "wine",
    "name": "Wine",
    "icon": "Grape",
    "color": "#9f1239",
    "image": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=300&h=300&fit=crop",
    "count": 0
  },
  {
    "id": "vodka",
    "name": "Vodka",
    "icon": "Droplets",
    "color": "#94a3b8",
    "image": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=300&fit=crop",
    "count": 0
  },
  {
    "id": "rum",
    "name": "Rum",
    "icon": "Flame",
    "color": "#78350f",
    "image": "https://images.unsplash.com/photo-1614313511387-1a94df665b71?w=300&h=300&fit=crop",
    "count": 0
  },
  {
    "id": "gin",
    "name": "Gin",
    "icon": "Leaf",
    "color": "#10b981",
    "image": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300&h=300&fit=crop",
    "count": 0
  },
  {
    "id": "tequila",
    "name": "Tequila",
    "icon": "Sun",
    "color": "#fbbf24",
    "image": "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=300&h=300&fit=crop",
    "count": 0
  },
  {
    "id": "liqueur",
    "name": "Liqueurs",
    "icon": "Sparkles",
    "color": "#d4a574",
    "image": "https://images.unsplash.com/photo-1594145075878-c28c7701c276?w=300&h=300&fit=crop",
    "count": 0
  },
  {
    "id": "brandy",
    "name": "Brandy",
    "icon": "GlassWater",
    "color": "#e11d48",
    "image": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300&h=300&fit=crop",
    "count": 0
  },
  {
    "id": "mixers",
    "name": "Mixers & Beverages",
    "icon": "CupSoda",
    "color": "#06b6d4",
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&h=300&fit=crop",
    "count": 0
  },
  {
    "id": "other",
    "name": "Others",
    "icon": "Package",
    "color": "#64748b",
    "image": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300&h=300&fit=crop",
    "count": 0
  }
];

export const products = [];

export function getProductById(id) {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts() {
  return products.filter((p) => p.badge === 'New').slice(0, 8);
}

export function getTrendingProducts() {
  return products.slice(0, 6);
}

