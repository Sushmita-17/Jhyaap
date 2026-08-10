import { useMemo, useState } from 'react';
import { User, ShieldCheck, Star, ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, Minus, Plus } from 'lucide-react';
import ProductCarousel from '@/components/ProductCarousel';
import { useCatalogStore, getFeaturedProducts, getTrendingProducts } from '@/store/catalogStore';
import { useAppStore } from '@/store/appStore';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useEffect, useState as useReactState } from 'react';

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useReactState('00:00:00');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(2, 0, 0, 0);
      if (now > target) {
        target.setDate(target.getDate() + 1);
      }
      const diff = target.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  return <span className="text-[#C9A84C] font-mono font-bold">{timeLeft}</span>;
}

function CountdownTimerMobile() {
  const [timeLeft, setTimeLeft] = useReactState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(2, 0, 0, 0);
      if (now > target) {
        target.setDate(target.getDate() + 1);
      }
      const diff = target.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      setTimeLeft({ h, m, s });
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col items-center">
        <span className="text-[#C9A84C] text-[13px] font-black font-mono leading-none">{timeLeft.h}</span>
        <span className="text-[6px] text-[#888888] font-bold uppercase tracking-wider mt-0.5">Hrs</span>
      </div>
      <span className="text-[#C9A84C] text-[12px] font-bold -mt-3.5 mx-0.5">:</span>
      <div className="flex flex-col items-center">
        <span className="text-[#C9A84C] text-[13px] font-black font-mono leading-none">{timeLeft.m}</span>
        <span className="text-[6px] text-[#888888] font-bold uppercase tracking-wider mt-0.5">Mins</span>
      </div>
      <span className="text-[#C9A84C] text-[12px] font-bold -mt-3.5 mx-0.5">:</span>
      <div className="flex flex-col items-center">
        <span className="text-[#C9A84C] text-[13px] font-black font-mono leading-none">{timeLeft.s}</span>
        <span className="text-[6px] text-[#888888] font-bold uppercase tracking-wider mt-0.5">Secs</span>
      </div>
    </div>
  );
}

const MOBILE_COMBOS = [
  {
    id: 'combo_2_mobile',
    name: 'Whisky Weekend',
    description: 'Signature Premium 750ml + 2x Soda 500ml + Lays family pack.',
    price: 3200,
    originalPrice: 3800,
    badge: '16% OFF',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=300',
    brand: 'NIGHTOWL EXCLUSIVE',
    category: 'Combo',
    subcategory: 'Bundle',
    volume: 'Set',
    abv: 'Mixed',
    rating: 5,
    reviews: 14,
    inStock: true,
    tags: ['whisky', 'combo']
  },
  {
    id: 'combo_3_mobile',
    name: 'Gin & Tonic Kit',
    description: 'Blue Riband 750ml + 3x Tonic Water + Fresh Lemon slices.',
    price: 1850,
    originalPrice: 2200,
    badge: '16% OFF',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=300',
    brand: 'NIGHTOWL EXCLUSIVE',
    category: 'Combo',
    subcategory: 'Bundle',
    volume: 'Set',
    abv: 'Mixed',
    rating: 4.8,
    reviews: 9,
    inStock: true,
    tags: ['gin', 'combo']
  },
  {
    id: 'combo_1_mobile',
    name: 'Night Starter Pack',
    description: 'Old Monk 750ml + Coke 1.5L + Ice.',
    price: 2450,
    originalPrice: 2850,
    badge: '14% OFF',
    image: 'https://images.unsplash.com/photo-1544145945-f904253db0ad?auto=format&fit=crop&q=80&w=300',
    brand: 'NIGHTOWL EXCLUSIVE',
    category: 'Combo',
    subcategory: 'Bundle',
    volume: 'Set',
    abv: 'Mixed',
    rating: 5,
    reviews: 28,
    inStock: true,
    tags: ['combo', 'value']
  },
  {
    id: 'combo_4_mobile',
    name: 'Party Mixer Pack',
    description: '8848 Vodka 750ml + Real Orange Juice 1L + Party Ice Bag.',
    price: 2900,
    originalPrice: 3400,
    badge: '15% OFF',
    image: 'https://images.unsplash.com/photo-1597075687490-8f673c6c179a?auto=format&fit=crop&q=80&w=300',
    brand: 'NIGHTOWL EXCLUSIVE',
    category: 'Combo',
    subcategory: 'Bundle',
    volume: 'Set',
    abv: 'Mixed',
    rating: 5,
    reviews: 42,
    inStock: true,
    tags: ['vodka', 'combo']
  }
];

const COMBOS = [
  {
    id: 'combo_1',
    name: 'Night Starter Pack',
    description: 'Old Monk 750ml + Coke 1.5L + Ice included in this nightowl exclusive bundle.',
    price: 2450,
    originalPrice: 2850,
    badge: 'BESTSELLER',
    image: 'https://images.unsplash.com/photo-1544145945-f904253db0ad?auto=format&fit=crop&q=80&w=300',
    brand: 'NIGHTOWL EXCLUSIVE',
    category: 'Combo',
    subcategory: 'Bundle',
    volume: 'Set',
    abv: 'Mixed',
    rating: 5,
    reviews: 28,
    inStock: true,
    tags: ['combo', 'value']
  },
  {
    id: 'combo_2',
    name: 'Whisky Weekend',
    description: 'Signature Premium 750ml + 2x Soda 500ml + Lays family pack.',
    price: 3200,
    originalPrice: 3800,
    badge: 'SAVE 20%',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=300',
    brand: 'NIGHTOWL EXCLUSIVE',
    category: 'Combo',
    subcategory: 'Bundle',
    volume: 'Set',
    abv: 'Mixed',
    rating: 5,
    reviews: 14,
    inStock: true,
    tags: ['whisky', 'combo']
  },
  {
    id: 'combo_3',
    name: 'Gin & Tonic Kit',
    description: 'Blue Riband 750ml + 3x Tonic Water + Fresh Lemon slices.',
    price: 1850,
    originalPrice: 2200,
    badge: 'POPULAR',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=300',
    brand: 'NIGHTOWL EXCLUSIVE',
    category: 'Combo',
    subcategory: 'Bundle',
    volume: 'Set',
    abv: 'Mixed',
    rating: 4.8,
    reviews: 9,
    inStock: true,
    tags: ['gin', 'combo']
  },
  {
    id: 'combo_4',
    name: 'Party Mixer Pack',
    description: '8848 Vodka 750ml + Real Orange Juice 1L + Party Ice Bag.',
    price: 2900,
    originalPrice: 3400,
    badge: 'VALUE',
    image: 'https://images.unsplash.com/photo-1597075687490-8f673c6c179a?auto=format&fit=crop&q=80&w=300',
    brand: 'NIGHTOWL EXCLUSIVE',
    category: 'Combo',
    subcategory: 'Bundle',
    volume: 'Set',
    abv: 'Mixed',
    rating: 5,
    reviews: 42,
    inStock: true,
    tags: ['vodka', 'combo']
  },
  {
    id: 'combo_5',
    name: 'Wine & Cheese Night',
    description: 'Sula Cabernet 750ml + Gourmet Cheese Platter + Crackers.',
    price: 2100,
    originalPrice: 2600,
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=300',
    brand: 'NIGHTOWL EXCLUSIVE',
    category: 'Combo',
    subcategory: 'Bundle',
    volume: 'Set',
    abv: 'Mixed',
    rating: 4.9,
    reviews: 18,
    inStock: true,
    tags: ['wine', 'combo']
  },
  {
    id: 'combo_6',
    name: 'Beer Bucket Deal',
    description: '6x Gorkha Beer 650ml + Spicy Peanuts + Choyla.',
    price: 3450,
    originalPrice: 3950,
    badge: 'BEST VALUE',
    image: 'https://images.unsplash.com/photo-1532634896-26909d0f4b89?auto=format&fit=crop&q=80&w=300',
    brand: 'NIGHTOWL EXCLUSIVE',
    category: 'Combo',
    subcategory: 'Bundle',
    volume: 'Set',
    abv: 'Mixed',
    rating: 5,
    reviews: 56,
    inStock: true,
    tags: ['beer', 'combo']
  },
  {
    id: 'combo_7',
    name: 'Rum & Coke Classic',
    description: 'Khukri XXX Rum 750ml + 2x Coke + Limes.',
    price: 2200,
    originalPrice: 2650,
    badge: 'LEGENDARY',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=300',
    brand: 'NIGHTOWL EXCLUSIVE',
    category: 'Combo',
    subcategory: 'Bundle',
    volume: 'Set',
    abv: 'Mixed',
    rating: 5,
    reviews: 120,
    inStock: true,
    tags: ['rum', 'combo']
  },
  {
    id: 'combo_8',
    name: 'Tequila Sunrise Kit',
    description: 'Jose Cuervo 750ml + Grenadine + Orange Juice.',
    price: 4500,
    originalPrice: 5200,
    badge: 'LIMITED',
    image: 'https://images.unsplash.com/photo-1516743611411-7171f43dadbf?auto=format&fit=crop&q=80&w=300',
    brand: 'NIGHTOWL EXCLUSIVE',
    category: 'Combo',
    subcategory: 'Bundle',
    volume: 'Set',
    abv: 'Mixed',
    rating: 4.7,
    reviews: 12,
    inStock: true,
    tags: ['tequila', 'combo']
  }
];

export default function HomePage() {
  const { products } = useCatalogStore();
  const { setPage, setSelectedCategory, setOnlyDeals } = useAppStore();
  const { addItem } = useCartStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [faqExpanded, setFaqExpanded] = useState(false);

  const featuredProducts = useMemo(() => getFeaturedProducts(products), [products]);
  const trendingProducts = useMemo(() => getTrendingProducts(products), [products]);
  const mobileFlashDeals = useMemo(() => featuredProducts.slice(0, 4), [featuredProducts]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-gold-primary/30 w-full overflow-x-hidden box-border ${
      isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]'
    }`}>
      {/* 1. FLASH DEALS UNIFIED SECTION */}
      <section id="deals" className={`scroll-mt-[150px] w-full pt-2 pb-6 md:pt-4 md:pb-12 ${
        isLight ? 'bg-white' : 'bg-[#0D0908]'
      }`}>
        
        {/* DESKTOP FLASH DEALS */}
        <div className="hidden md:block max-w-[1248px] mx-auto px-4">
          <div className={`border rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] ${
            isLight 
              ? 'bg-white border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)]' 
              : 'bg-[#16110F] border-white/5'
          }`}>
            {/* HEADER: URGENCY & STATUS */}
            <div className={`border-b p-5 md:p-8 ${
              isLight 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-[#1E1614] border-white/5'
            }`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="flex flex-col">
                    <span className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[3px] mb-1">Live Now</span>
                    <h2 className={`text-[24px] md:text-[32px] font-serif font-bold flex items-center gap-3 ${
                      isLight ? 'text-gray-900' : 'text-[#F5ECD7]'
                    }`}>
                      Flash Deals
                    </h2>
                  </div>
                  <div className={`h-10 w-[1px] hidden md:block ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <CountdownTimer />
                      <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded-full animate-pulse">Running</span>
                    </div>
                    <span className={`text-[12px] font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Resetting tonight at 2:00 AM NST</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setOnlyDeals(true); setPage('products'); }}
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.12em] transition-all ${
                      isLight 
                        ? 'border-gray-300 bg-gray-100 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#F7F5E8]' 
                        : 'border-white/10 bg-white/5 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-white/10'
                    }`}
                  >
                    View Deals
                  </button>
                </div>
              </div>
            </div>

            {/* BODY 1: COMBO PACKS (Carousel) */}
            <div className={`p-5 md:p-8 lg:p-10 ${
              isLight ? 'bg-gray-50' : 'bg-[#16110F]'
            }`}>
              <ProductCarousel
                label="Maximize Value"
                title="Bundle & Save: Combo Packs"
                products={COMBOS as any}
                actionLabel="View all combos ->"
              />
            </div>

            {/* BODY 2: TONIGHT'S PRICE DROPS (Carousel) */}
            <div className={`p-5 md:p-8 lg:p-10 border-t ${
              isLight 
                ? 'bg-gray-100 border-gray-200' 
                : 'bg-black/40 border-white/5'
            }`}>
              <ProductCarousel
                label="Limited quantities available"
                title="Tonight's Price Drops"
                products={featuredProducts}
                onAction={() => { setOnlyDeals(true); setPage('products'); }}
                actionLabel="Explore all deals ->"
              />
            </div>
          </div>
        </div>

        {/* MOBILE FLASH DEALS */}
        <div className="block md:hidden px-3">
          <div className={`border rounded-[16px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] ${
            isLight 
              ? 'bg-white border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)]' 
              : 'bg-gradient-to-br from-[#16110F] to-[#0F0D0B] border-white/5'
          }`}>

            {/* MOBILE HEADER */}
            <div className={`border-b px-3 py-3 ${
              isLight 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-gradient-to-r from-[#1D1613] to-[#17110E] border-white/5'
            }`}>
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[#C9A84C] text-[16px] leading-none">&#9889;</span>
                  <div className="min-w-0">
                    <h2 className="text-[12px] font-extrabold text-[#C9A84C] tracking-[2px] uppercase leading-none">
                      Live Flash
                      <br />
                      Deals
                    </h2>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <CountdownTimerMobile />
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-[7px] text-green-500 font-bold uppercase bg-green-500/10 px-1.5 py-0.5 rounded tracking-wide animate-pulse">
                    Running
                  </span>
                  <button
                    onClick={() => { setOnlyDeals(true); setPage('products'); }}
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.12em] transition-all whitespace-nowrap ${
                      isLight 
                        ? 'border-gray-300 bg-gray-100 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#F7F5E8]' 
                        : 'border-white/10 bg-white/5 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-white/10'
                    }`}
                  >
                    View Deals
                  </button>
                </div>
              </div>
            </div>

            {/* MOBILE BODY 1: LIVE FLASH DEALS */}
            <div className={`p-2.5 border-t md:p-4 ${
              isLight 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-[#16110F] border-white/5'
            }`}>
              <ProductCarousel
                title=""
                products={mobileFlashDeals}
                showHeader={false}
              />
            </div>
            {/* MOBILE BODY 2: TONIGHT'S PRICE DROPS */}
            <div className={`p-2.5 border-t md:p-4 ${
              isLight 
                ? 'bg-gray-100 border-gray-200' 
                : 'bg-black/40 border-white/5'
            }`}>
              <ProductCarousel
                label="Limited quantities available"
                title="Tonight's Price Drops"
                products={featuredProducts}
                onAction={() => { setOnlyDeals(true); setPage('products'); }}
                actionLabel="Explore all deals ->"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECONDARY CAROUSEL SECTIONS */}
      <div className={`flex flex-col gap-6 md:gap-16 pb-10 md:pb-20 w-full box-border pt-3 md:pt-8 ${
        isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]'
      }`}>
        
        {/* TRENDING SECTION */}
        <div id="trending" className="scroll-mt-[150px] max-w-[1248px] mx-auto w-full px-3 md:px-4">
          <div className={`border rounded-[16px] md:rounded-[32px] p-2.5 md:p-6 shadow-xl transition-all hover:border-white/10 ${
            isLight 
              ? 'bg-white border-gray-200 hover:border-gray-300' 
              : 'bg-gradient-to-br from-[#16110F] to-[#0F0D0B] border-white/5'
          }`}>
            <ProductCarousel
              label="What's selling now"
              title="Trending Products"
              products={trendingProducts}
              onAction={() => setPage('products')}
              actionLabel="Browse all ->"
            />
          </div>
        </div>

        {/* NEW ARRIVALS SECTION */}
        <div id="new-arrivals" className="scroll-mt-[150px] max-w-[1248px] mx-auto w-full px-3 md:px-4">
          <div className={`border rounded-[16px] md:rounded-[32px] p-2.5 md:p-6 shadow-xl hover:border-white/10 transition-all ${
            isLight 
              ? 'bg-white border-gray-200 hover:border-gray-300' 
              : 'bg-gradient-to-br from-[#16110F] to-[#0F0D0B] border-white/5'
          }`}>
            <ProductCarousel
              label="Recent additions"
              title="New Arrivals"
              products={featuredProducts.slice().reverse()}
              onAction={() => setPage('products')}
              actionLabel="Check more ->"
            />
          </div>
        </div>

        {/* ALL PRODUCTS SECTION */}
        <div id="all-products" className="scroll-mt-[150px] w-full px-3 md:px-4 max-w-[1248px] mx-auto">
          <div className={`border rounded-[16px] md:rounded-[28px] p-2.5 md:p-6 hover:border-white/10 transition-all shadow-xl ${
            isLight 
              ? 'bg-white border-gray-200 hover:border-gray-300' 
              : 'bg-gradient-to-br from-[#16110F] to-[#0F0D0B] border-white/5'
          }`}>
            <ProductCarousel
              label="Our entire collection"
              title="All Products"
              products={products}
              onAction={() => setPage('products')}
              actionLabel="Shop all ->"
            />
          </div>
        </div>

        {/* 3. SIDE-BY-SIDE REVIEWS & FAQ */}
        <section className="flex flex-col md:flex-row gap-[10px] md:gap-[24px] items-start px-3 md:px-[40px] py-[10px] md:py-[48px] max-w-[1248px] mx-auto w-full box-border">
          {/* LEFT CARD - REVIEWS */}
          <div className={`flex-1 w-full border rounded-[12px] md:rounded-[12px] flex flex-col overflow-hidden transition-all ${reviewsExpanded ? 'h-[346px] md:h-[400px]' : 'h-[156px] md:h-[245px]'}` + 
            (isLight ? ' bg-white border-gray-200' : ' bg-[#16110F] border-[#2A201C]')}>
            <div className="p-[10px_12px_0_12px] md:p-[14px_16px_0_16px] shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-gold-primary text-[8px] font-bold uppercase tracking-[1.5px] block">Customer Reviews</span>
                  <h2 className={`text-[13px] md:text-[18px] font-bold mt-0.5 leading-none ${isLight ? 'text-gray-900' : 'text-white'}`}>Reviews</h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setReviewsExpanded(!reviewsExpanded)}
                    className={`flex items-center justify-center w-10 h-10 md:w-7 md:h-7 rounded-full border bg-[#1B1411] text-gold-primary hover:bg-gold-primary hover:text-black transition-all shadow-[0_0_0_1px_rgba(201,168,76,0.08)] ${
                      isLight ? 'bg-gray-100 border-gray-300' : 'border-gold-primary/40'
                    }`}
                    aria-label={reviewsExpanded ? 'Collapse reviews' : 'Expand reviews'}
                  >
                    {reviewsExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => setPage('reviews')}
                    className="inline-flex items-center gap-1 border border-gold-primary/40 hover:border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-black text-[8px] md:text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all"
                  >
                    <Star className="w-2 h-2 fill-current" />
                    Add Review
                  </button>
                </div>
              </div>
              <div className={`border-b mt-[8px] md:mt-[14px] pb-[8px] md:pb-[14px] ${
                isLight ? 'border-gray-200' : 'border-[#2A201C]'
              }`} />
            </div>

            <div className={`relative flex-1 ${reviewsExpanded ? 'overflow-y-auto' : 'overflow-hidden'}`}>
              <div
                id="reviews-scroll"
                className={`overflow-y-auto p-[6px_12px] md:p-[12px_20px] custom-scrollbar h-full ${reviewsExpanded ? 'block' : 'hidden md:block'}`}
              >
                {[
                  { name: 'Aayush', area: 'Lazimpat', text: 'Got a call confirming the time, and the guy actually came when he said he would.' },
                  { name: 'Prakriti', area: 'Jhamsikhel', text: 'I could see 750ml vs 1L before paying. Exactly what I needed.' },
                  { name: 'Sameer', area: 'Baneshwor', text: 'Packaging was discrete and the alcohol was original. Will reorder.' }
                ].map((r, i) => (
                  <div key={i} className={`border rounded-[6px] p-[8px] mb-[6px] ${
                    isLight 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-[#1C1513] border-[#2A201C]'
                  }`}>
                    <div className="flex gap-0.5 mb-[3px]">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-2 h-2 fill-gold-primary text-gold-primary" />)}
                    </div>
                    <p className={`text-[10px] italic leading-[1.4] mb-[6px] ${isLight ? 'text-gray-700' : 'text-[#DDDDDD]'}`}>&ldquo;{r.text}&rdquo;</p>
                    <div className="flex justify-between items-center">
                      <p className={`text-[9px] font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{r.name}</p>
                      <p className={`text-[9px] ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>{r.area}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-[10px_12px] md:p-[12px_20px] border-t shrink-0 flex justify-between items-center ${
              isLight ? 'border-gray-200' : 'border-[#2A201C]'
            }`}>
              <p className={`text-[9px] md:text-[10px] ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>5,000+ happy customers</p>
              <button onClick={() => setPage('reviews')} className="text-[9px] md:text-[10px] font-bold text-gold-primary hover:underline">
                {'All reviews ->'}
              </button>
            </div>
          </div>

          {/* RIGHT CARD - FAQ */}
          <div className={`flex-1 w-full border rounded-[12px] md:rounded-[12px] flex flex-col overflow-hidden transition-all ${faqExpanded ? 'h-[346px] md:h-[400px]' : 'h-[132px] md:h-[245px]'}` + 
            (isLight ? ' bg-white border-gray-200' : ' bg-[#16110F] border-[#2A201C]')}>
            <div className="p-[10px_12px_0_12px] md:p-[14px_16px_0_16px] shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className={`text-[13px] md:text-[18px] font-bold leading-none ${isLight ? 'text-gray-900' : 'text-white'}`}>Common questions</h2>
                  <p className={`text-[10px] md:text-[12px] mt-0.5 ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Stuff people ask before ordering.</p>
                </div>
                <button
                  onClick={() => setFaqExpanded(!faqExpanded)}
                  className={`flex items-center justify-center w-7 h-7 rounded-full border bg-[#1B1411] text-gold-primary hover:bg-gold-primary hover:text-black transition-all shadow-[0_0_0_1px_rgba(201,168,76,0.08)] shrink-0 ${
                    isLight ? 'bg-gray-100 border-gray-300' : 'border-gold-primary/40'
                  }`}
                  aria-label={faqExpanded ? 'Collapse common questions' : 'Expand common questions'}
                >
                  {faqExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </button>
              </div>
              <div className={`border-b mt-[8px] md:mt-[14px] pb-[8px] md:pb-[14px] ${
                isLight ? 'border-gray-200' : 'border-[#2A201C]'
              }`} />
            </div>

            <div className={`relative flex-1 ${faqExpanded ? 'overflow-y-auto' : 'overflow-hidden'}`}>
              <div
                id="faq-scroll"
                className={`overflow-y-auto p-[0_16px] md:p-[0_20px] custom-scrollbar h-full ${faqExpanded ? 'block' : 'hidden md:block'}`}
              >
                {[
                  { q: "How do I actually place an order?", a: "Pick your bottles, add them to the cart, and checkout with your address. We call or message to confirm timing." },
                  { q: "Do you deliver after dark?", a: "Yes, for many areas in the valley. We'll tell you honestly when we confirm the order." },
                  { q: "Why do I need to confirm I'm 18+?", a: "It's the law, and our riders check ID at the door." },
                  { q: "Can I see where my order is?", a: "Once it's placed, check your account for status updates - confirmed, out for delivery, etc." }
                ].map((item, idx) => (
                  <FaqItem key={idx} item={item} isLight={isLight} />
                ))}
              </div>
            </div>

            <div className={`p-[10px_12px] md:p-[12px_20px] border-t shrink-0 text-right ${
              isLight ? 'border-gray-200' : 'border-[#2A201C]'
            }`}>
              <button onClick={() => setPage('faqs')} className="text-[9px] md:text-[11px] font-bold text-gold-primary hover:underline">
                {'See all FAQs ->'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function FaqItem({ item, isLight }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b py-[8px] md:py-[12px] ${isLight ? 'border-gray-200' : 'border-[#1E1E1E]'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center cursor-pointer group gap-2">
        <span className={`text-[10px] md:text-[12px] font-medium transition-colors group-hover:text-white text-left ${
          isLight ? 'text-gray-700 group-hover:text-gray-900' : 'text-[#DDDDDD]'
        }`}>{item.q}</span>
        <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-all ${open ? 'rotate-180 text-gold-primary' : ''} ${isLight ? 'text-gray-400' : 'text-[#888888]'}`} />
      </button>
      {open && (
        <p className="text-[9px] md:text-[11px] text-gold-primary leading-[1.5] pt-[6px] pb-[2px] animate-in fade-in duration-200">
          {item.a}
        </p>
      )}
    </div>
  );
}
















