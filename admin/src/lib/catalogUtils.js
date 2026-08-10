export const CATEGORY_META = {
  whiskey: { name: 'Whiskey', icon: 'Wine', color: '#c4841a' },
  vodka: { name: 'Vodka', icon: 'Droplets', color: '#94a3b8' },
  wine: { name: 'Wine', icon: 'Grape', color: '#9f1239' },
  beer: { name: 'Beer', icon: 'Beer', color: '#f59e0b' },
  rum: { name: 'Rum', icon: 'Flame', color: '#78350f' },
  gin: { name: 'Gin', icon: 'Leaf', color: '#10b981' },
  tequila: { name: 'Tequila', icon: 'Sun', color: '#fbbf24' },
  liqueur: { name: 'Liqueur', icon: 'Sparkles', color: '#d4a574' },
  brandy: { name: 'Brandy', icon: 'Wine', color: '#92400e' },
  mixers: { name: 'Mixers', icon: 'Droplets', color: '#38bdf8' },
  japanese: { name: 'Japanese', icon: 'Sun', color: '#dc2626' },
  tobacco: { name: 'Tobacco', icon: 'Flame', color: '#57534e' },
  glass: { name: 'Glassware', icon: 'Sparkles', color: '#a78bfa' },
  offers: { name: 'Offers', icon: 'BadgePercent', color: '#f43f5e' },
};

function cleanCategoryLabel(value) {
  return String(value ?? '')
    .replace(/[ÂÃâ?£]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
export function buildCategories(
  products,
  custom,
) {
  const counts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const ids = new Set([...Object.keys(counts), ...custom.map((c) => c.id)]);

  return [...ids]
    .map((id) => {
      const customCat = custom.find((c) => c.id === id);
      const meta = CATEGORY_META[id];
      const sample = products.find((p) => p.category === id);
      return {
        id,
        name: cleanCategoryLabel(customCat?.name ?? meta?.name ?? id),
        icon: customCat?.icon ?? meta?.icon ?? 'Package',
        color: customCat?.color ?? meta?.color ?? '#64748b',
        count: counts[id] ?? 0,
        image: customCat?.image ?? sample?.image ?? '',
      };
    })
    .filter((c) => c.count > 0 || custom.some((x) => x.id === c.id))
    .sort((a, b) => b.count - a.count);
}

export const DEFAULT_BANNERS = [
  {
    id: 'jhyaap-1',
    title: 'Stop calling three shops.',
    subtitle: 'Check the bottle, size, and price yourself. Pay COD, eSewa, or Khalti â€” whatever works for you.',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&h=500&fit=crop',
    cta: 'Browse bottles',
    link: '/products?category=whiskey',
    tag: 'FROM OUR SHELF',
  },
  {
    id: 'jhyaap-2',
    title: 'Kathmandu Â· Lalitpur Â· Bhaktapur',
    subtitle: 'We confirm your area and timing after you order. No guessing, no vague "soon" messages.',
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=1200&h=500&fit=crop',
    cta: 'Check delivery areas',
    link: '/products?category=wine',
    tag: 'VALLEY COVERAGE',
  },
  {
    id: 'jhyaap-3',
    title: 'Late night? We deliver.',
    subtitle: 'Whisky, beer, wine â€” order from Bhaktapur and get it across the valley when most shops are shut.',
    image: 'https://images.unsplash.com/photo-1594145075878-c28c7701c276?w=1200&h=500&fit=crop',
    cta: 'See what we have',
    link: '/products?category=beer',
    tag: 'OPEN LATE',
  },
];

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}


