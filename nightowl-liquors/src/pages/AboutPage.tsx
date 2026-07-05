import { MapPin, ShieldCheck, Clock } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { STORE_INFO } from '@/lib/storeInfo';
import PageBackButton from '@/components/PageBackButton';

export default function AboutPage() {
  const { setPage } = useAppStore();

  return (
    <div className="min-h-screen bg-night-950 pb-16 text-night-100">
      <div className="border-b border-night-700/50 py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <PageBackButton to="home" label="Back to home" className="mb-4" />
          <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">About us</h1>
          <p className="mt-6 text-lg leading-8 text-night-300">
            Jhyaap Station started because ordering drinks at night in Kathmandu used to mean calling around,
            getting vague answers, and hoping the bottle was real. We wanted something simpler: see the price,
            see the size, order, and get a straight answer on delivery.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-12 px-4 py-12">
        <section className="space-y-4 text-sm leading-7 text-night-300">
          <h2 className="text-xl font-semibold text-white">What we actually do</h2>
          <p>
            We run <strong className="text-white">{STORE_INFO.name}</strong> in Kathmandu and deliver across Kathmandu, Lalitpur, and Bhaktapur. The website
            is our shelf — same stock, same prices you’d ask for at the counter. When you checkout, our team packs
            the order and hands it to a rider. That’s it. No marketplace, no mystery third parties.
          </p>
          <p>
            Night orders are a big part of what we do. Birthdays run late. Guests show up unannounced. You finish
            work and realise the fridge is empty. We built the store around those moments.
          </p>
          <button onClick={() => setPage('products')} className="btn-primary mt-2">
            Browse the shelf
          </button>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Three things we won’t compromise on</h2>
          <ul className="space-y-4">
            {[
              {
                icon: ShieldCheck,
                title: 'Genuine bottles',
                text: 'We source from proper channels and check what goes out. If something looks off, we don’t ship it.',
              },
              {
                icon: Clock,
                title: 'Honest timing',
                text: 'We’d rather say “45 minutes” and mean it than promise 15 and leave you waiting.',
              },
              {
                icon: MapPin,
                title: 'ID at the door',
                text: '18+ only. Our riders verify age on delivery. Non-negotiable.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex gap-4 rounded-xl border border-night-600/30 p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-neon-amber" />
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-night-400">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-night-600/40 bg-night-900/40 p-6">
          <h2 className="text-lg font-semibold text-white">Where we deliver</h2>
          <p className="mt-2 text-sm leading-7 text-night-400">
            Kathmandu, Lalitpur, and Bhaktapur — coverage depends on your exact area and the time of night.
            Message us on WhatsApp before a big order if you’re not sure.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {STORE_INFO.deliveryCities.map((city) => (
              <span key={city} className="rounded-md bg-night-800 px-3 py-1 text-xs text-night-300">
                {city}
              </span>
            ))}
          </div>
          <div className="mt-6 h-48 overflow-hidden rounded-lg border border-night-700/50">
            <iframe
              title="Jhyaap Station location"
              src={STORE_INFO.mapsEmbedUrl}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
