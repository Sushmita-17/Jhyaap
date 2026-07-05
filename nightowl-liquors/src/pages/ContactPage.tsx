import { useState } from 'react';
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { STORE_INFO } from '@/lib/storeInfo';
import PageBackButton from '@/components/PageBackButton';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-night-950 text-night-100 pb-16">
      <div className="border-b border-night-700/50 py-14 sm:py-16">
        <div className="mx-auto max-w-2xl px-4">
          <PageBackButton to="home" label="Back to home" className="mb-4" />
          <h1 className="font-display text-4xl font-bold text-white">Get in touch</h1>
          <p className="mt-4 text-lg leading-8 text-night-400">
            Order stuck? Not sure we deliver to your area? Just want to ask if something’s in stock? Call, email, or WhatsApp — a real person picks up during shop hours.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-night-600/40 bg-night-900/50 p-6">
            <h2 className="text-lg font-bold text-white">Contact Details</h2>
            <div className="mt-5 space-y-4 text-sm text-night-300">
              <a href={`tel:${STORE_INFO.phoneTel}`} className="flex items-center gap-3 hover:text-neon-amber">
                <Phone className="h-5 w-5 text-neon-amber" />
                {STORE_INFO.phone}
              </a>
              <a href={`mailto:${STORE_INFO.email}`} className="flex items-center gap-3 hover:text-neon-amber">
                <Mail className="h-5 w-5 text-neon-amber" />
                {STORE_INFO.email}
              </a>
              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 hover:text-neon-amber"
              >
                <MapPin className="h-5 w-5 text-neon-amber" />
                {STORE_INFO.address}
              </a>
              <p className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-neon-amber" />
                Night delivery across Kathmandu Valley
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-night-600/40 bg-night-900/50 p-6">
            <h2 className="text-lg font-bold text-white">Delivery Areas</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {STORE_INFO.deliveryCities.map((city) => (
                <span key={city} className="rounded-full bg-neon-amber/10 px-3 py-1 text-xs font-semibold text-neon-amber">
                  {city}
                </span>
              ))}
            </div>
          </div>

          <a
            href={STORE_INFO.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-neon-amber/30 bg-neon-amber/10 px-5 py-4 text-sm font-semibold text-neon-amber hover:bg-neon-amber/20"
          >
            <MessageCircle className="h-5 w-5" />
            Chat on WhatsApp
          </a>

          <div className="h-56 overflow-hidden rounded-2xl border border-night-700/50">
            <iframe
              title="Jhyaap Station Location"
              src={STORE_INFO.mapsEmbedUrl}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-night-600/40 bg-night-900/50 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white">Send a Message</h2>
          <p className="mt-2 text-sm text-night-400">We typically respond during service hours.</p>

          {submitted ? (
            <div className="mt-8 rounded-xl border border-neon-amber/30 bg-neon-amber/10 p-5 text-sm text-night-200">
              Thank you for reaching out. Our team will get back to you shortly.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-night-400">
                  Name
                </label>
                <input id="name" name="name" required className="input-field w-full" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-night-400">
                  Phone
                </label>
                <input id="phone" name="phone" required className="input-field w-full" placeholder="+977 ..." />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-night-400">
                  Email
                </label>
                <input id="email" name="email" type="email" className="input-field w-full" placeholder="you@email.com" />
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-night-400">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="input-field w-full resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button type="submit" className="btn-primary inline-flex w-full items-center justify-center gap-2">
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
