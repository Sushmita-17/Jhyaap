import FaqSection from '@/components/FaqSection';
import { useAppStore } from '@/store/appStore';
import { MessageCircle } from 'lucide-react';
import PageBackButton from '@/components/PageBackButton';

export default function FaqPage() {
  const { setPage } = useAppStore();

  return (
    <div className="min-h-screen bg-[#0D0908] text-[#F5ECD7] pb-10 md:pb-16">
      <div className="border-b border-white/5 bg-[#16110F]/40 py-4 md:py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-3 md:px-4">
          <PageBackButton to="home" label="Back to Jhyaap Station" className="mb-2" />
          <div className="text-center">
          <p className="text-[9px] md:text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Help Center</p>
          <h1 className="mt-1 md:mt-3 font-display text-xl md:text-4xl font-extrabold text-white sm:text-5xl">Questions we get a lot</h1>
          <p className="mx-auto mt-2 md:mt-5 max-w-2xl text-xs md:text-lg leading-5 md:leading-8 text-[#888888]">
            Ordering, delivery times, payments, ID checks — the practical stuff.
          </p>
          </div>
        </div>
      </div>

      <FaqSection showHeader={false} />

      <section className="mx-auto max-w-7xl px-3 md:px-4 pb-5 md:pb-8">
        <div className="rounded-2xl border border-white/5 bg-[#16110F]/50 p-3 md:p-6 text-center sm:p-8">
          <p className="text-[10px] md:text-sm text-[#888888]">Still stuck?</p>
          <button
            onClick={() => setPage('contact')}
            className="mt-2 md:mt-4 inline-flex items-center gap-2 bg-[#C9A84C] text-black px-3 md:px-6 py-1.5 md:py-3 rounded-lg font-bold text-[10px] md:text-sm uppercase tracking-wider hover:bg-white transition-all"
          >
            <MessageCircle className="h-2.5 w-2.5 md:h-4 md:w-4" />
            Call or message us
          </button>
        </div>
      </section>
    </div>
  );
}

