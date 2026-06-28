import FaqSection from '@/components/FaqSection';
import { useAppStore } from '@/store/appStore';
import { MessageCircle } from 'lucide-react';
import PageBackButton from '@/components/PageBackButton';

export default function FaqPage() {
  const { setPage } = useAppStore();

  return (
    <div className="min-h-screen bg-night-950 text-night-100 pb-16">
      <div className="border-b border-night-700/50 bg-night-900/40 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <PageBackButton to="home" label="Back to home" className="mb-4" />
          <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Help Center</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">Questions we get a lot</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-night-400">
            Ordering, delivery times, payments, ID checks — the practical stuff.
          </p>
          </div>
        </div>
      </div>

      <FaqSection showHeader={false} />

      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="rounded-2xl border border-night-600/40 bg-night-900/50 p-6 text-center sm:p-8">
          <p className="text-sm text-night-400">Still stuck?</p>
          <button
            onClick={() => setPage('contact')}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Call or message us
          </button>
        </div>
      </section>
    </div>
  );
}
