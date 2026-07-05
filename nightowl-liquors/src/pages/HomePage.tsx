import { useMemo, useState } from 'react';
import { User, ShieldCheck, Star, ChevronDown, ShoppingCart, Minus, Plus } from 'lucide-react';
import ProductCarousel from '@/components/ProductCarousel';
import { useCatalogStore, getFeaturedProducts, getTrendingProducts } from '@/store/catalogStore';
import { useAppStore } from '@/store/appStore';
import { useCartStore } from '@/store/cartStore';
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

  const featuredProducts = useMemo(() => getFeaturedProducts(products), [products]);
  const trendingProducts = useMemo(() => getTrendingProducts(products), [products]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen font-sans selection:bg-gold-primary/30 w-full overflow-x-hidden box-border">
      {/* 1. FLASH DEALS UNIFIED CONTAINER */}
      <section className="w-full bg-[#0D0908] pt-4 pb-12">
        <div className="max-w-[1248px] mx-auto px-4">
          <div className="bg-[#16110F] border border-white/5 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            
            {/* HEADER: URGENCY & STATUS */}
            <div className="bg-[#1E1614] border-b border-white/5 p-5 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="flex flex-col">
                    <span className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[3px] mb-1">Live Now</span>
                    <h2 className="text-[24px] md:text-[32px] font-serif font-bold text-[#F5ECD7] flex items-center gap-3">
                      ⚡ Flash Deals
                    </h2>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <CountdownTimer />
                      <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded-full animate-pulse">Running</span>
                    </div>
                    <span className="text-[#888888] text-[12px] font-medium">Resetting tonight at 2:00 AM NST</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 px-5 py-3 rounded-2xl">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-[#1E1614] bg-[#2A201C] flex items-center justify-center">
                        <User className="w-3 h-3 text-[#C9A84C]" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[#F5ECD7] text-[12px] font-medium">
                    <span className="text-[#C9A84C] font-bold">140+</span> people browsing deals
                  </p>
                </div>
              </div>
            </div>

            {/* BODY 1: COMBO PACKS (Carousel) */}
            <div className="p-5 md:p-8 bg-[#16110F]">
              <ProductCarousel
                label="Maximize Value"
                title="Bundle & Save: Combo Packs"
                products={COMBOS as any}
                actionLabel="View all combos →"
              />
            </div>

            {/* BODY 2: TONIGHT'S PRICE DROPS (Carousel) */}
            <div id="deals" className="p-5 md:p-8 bg-black/40 border-t border-white/5 scroll-mt-[138px]">
              <ProductCarousel
                label="Limited quantities available"
                title="Tonight's Price Drops"
                products={featuredProducts}
                onAction={() => { setOnlyDeals(true); setPage('products'); }}
                actionLabel="Explore all deals →"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECONDARY CAROUSEL SECTIONS */}
      <div className="flex flex-col gap-12 md:gap-16 pb-20 w-full box-border pt-8 bg-[#0A0A0A]">
        
        {/* TRENDING SECTION */}
        <div id="trending" className="scroll-mt-[150px] max-w-[1248px] mx-auto w-full px-4">
          <div className="bg-[#16110F] border border-white/5 rounded-[24px] md:rounded-[32px] p-2 md:p-6 shadow-xl transition-all hover:border-white/10">
            <ProductCarousel
              label="What's selling now"
              title="Trending Products"
              products={trendingProducts}
              onAction={() => setPage('products')}
              actionLabel="Browse all →"
            />
          </div>
        </div>

        {/* NEW ARRIVALS SECTION */}
        <div id="new-arrivals" className="scroll-mt-[150px] max-w-[1248px] mx-auto w-full px-4">
          <div className="bg-[#16110F] border border-white/5 rounded-[24px] md:rounded-[32px] p-2 md:p-6 shadow-xl transition-all hover:border-white/10">
            <ProductCarousel
              label="Recent additions"
              title="New Arrivals"
              products={featuredProducts.slice().reverse()}
              onAction={() => setPage('products')}
              actionLabel="Check more →"
            />
          </div>
        </div>

        {/* ALL PRODUCTS SECTION */}
        <div id="all-products" className="scroll-mt-[150px] max-w-[1248px] mx-auto w-full px-4">
          <div className="bg-[#16110F] border border-white/5 rounded-[24px] md:rounded-[32px] p-2 md:p-6 shadow-xl transition-all hover:border-white/10">
            <ProductCarousel
              label="Our entire collection"
              title="All Products"
              products={products}
              onAction={() => setPage('products')}
              actionLabel="Shop all →"
            />
          </div>
        </div>

        {/* 3. SIDE-BY-SIDE REVIEWS & FAQ (NEW FIXED HEIGHT DESIGN) */}
        <section className="flex flex-col md:flex-row gap-[24px] items-start px-4 md:px-[40px] py-[48px] max-w-[1248px] mx-auto w-full box-border">
          
          {/* LEFT CARD — REVIEWS */}
          <div className="flex-1 w-full bg-[#16110F] border border-[#2A201C] rounded-[12px] h-[300px] md:h-[420px] flex flex-col overflow-hidden transition-all mb-4 md:mb-0">
            <div className="p-[20px_20px_0_20px] shrink-0">
              <span className="text-gold-primary text-[10px] font-bold uppercase tracking-[1.5px] block">UNFILTERED — WELL, MOSTLY.</span>
              <h2 className="text-[20px] font-bold text-white mt-1">Reviews</h2>
              <p className="text-[#888888] text-[12px] mt-0.5">Verified customer experiences.</p>
              <div className="border-b border-[#2A201C] mt-[14px] pb-[14px]" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-[12px_20px] custom-scrollbar">
              {[
                { name: 'Aayush', area: 'Lazimpat', text: 'Ordered around 11pm before friends showed up. Got a call confirming the time, and the guy actually came when he said he would.' },
                { name: 'Prakriti', area: 'Jhamsikhel', text: 'I usually end up calling two shops and still not getting the right bottle size. Here I could see 750ml vs 1L before paying.' },
                { name: 'Sameer', area: 'Baneshwor', text: 'First time trying Nightowl. The packaging was discrete and the alcohol was definitely original. Will reorder.' }
              ].map((r, i) => (
                <div key={i} className="bg-[#1C1513] border border-[#2A201C] rounded-[8px] p-[14px] mb-[10px]">
                  <div className="flex gap-1 mb-[6px]">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-gold-primary text-gold-primary" />)}
                  </div>
                  <p className="text-[12px] text-[#DDDDDD] italic leading-[1.5] mb-[10px]">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-white font-bold">{r.name}</p>
                    <p className="text-[11px] text-[#888888]">{r.area}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-[12px_20px] border-t border-[#2A201C] shrink-0 flex justify-between items-center">
              <p className="text-[11px] text-[#888888]">5,000+ happy customers</p>
              <button onClick={() => setPage('reviews')} className="text-[11px] font-bold text-gold-primary hover:underline">
                All reviews →
              </button>
            </div>
          </div>

          {/* RIGHT CARD — FAQ */}
          <div className="flex-1 w-full bg-[#16110F] border border-[#2A201C] rounded-[12px] h-[300px] md:h-[420px] flex flex-col overflow-hidden transition-all">
            <div className="p-[20px_20px_0_20px] shrink-0">
              <h2 className="text-[20px] font-bold text-white">Common questions</h2>
              <p className="text-[#888888] text-[12px] mt-0.5">The stuff people usually ask before their first order.</p>
              <div className="border-b border-[#2A201C] mt-[14px] pb-[14px]" />
            </div>

            <div className="flex-1 overflow-y-auto p-[0_20px] custom-scrollbar">
              {[
                { q: 'How do I actually place an order?', a: 'Pick your bottles, add them to the cart, and checkout with your address. We call or message to confirm timing.' },
                { q: 'Do you deliver after dark?', a: 'Yes, for many areas in the valley. We’ll tell you honestly when we confirm the order.' },
                { q: 'Why do I need to confirm I’m 18+?', a: 'It’s the law, and our riders check ID at the door.' },
                { q: 'Can I see where my order is?', a: 'Once it’s placed, check your account for status updates — confirmed, out for delivery, etc.' }
              ].map((item, idx) => (
                <FaqItem key={idx} item={item} />
              ))}
            </div>

            <div className="p-[12px_20px] border-t border-[#2A201C] shrink-0 text-right">
              <button onClick={() => setPage('faqs')} className="text-[11px] font-bold text-gold-primary hover:underline">
                See all FAQs →
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function FaqItem({ item }: { item: { q: string, a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1E1E1E] py-[14px]">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center cursor-pointer group">
        <span className="text-[13px] font-medium text-[#DDDDDD] transition-colors group-hover:text-white text-left">{item.q}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#888888] transition-all ${open ? 'rotate-180 text-gold-primary' : ''}`} />
      </button>
      {open && (
        <p className="text-[12px] text-gold-primary leading-[1.6] pt-[8px] pb-[2px] animate-in fade-in duration-200">
          {item.a}
        </p>
      )}
    </div>
  );
}
