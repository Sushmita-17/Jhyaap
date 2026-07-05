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

      <div className="mx-auto grid max-w-6xl gap-4 md:gap-8 px-3 md:px-4 py-8 md:py-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4 md:space-y-5">
          <div className="rounded-2xl border border-white/5 bg-[#16110F]/50 p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-white">Contact Details</h2>
            <div className="mt-3 md:mt-5 space-y-3 md:space-y-4 text-xs md:text-sm text-[#DDDDDD]">
              <a href={`tel:${STORE_INFO.phoneTel}`} className="flex items-center gap-2 md:gap-3 hover:text-[#C9A84C]">
                <Phone className="h-4 w-4 md:h-5 md:w-5 text-[#C9A84C]" />
                {STORE_INFO.phone}
              </a>
              <a href={`mailto:${STORE_INFO.email}`} className="flex items-center gap-2 md:gap-3 hover:text-[#C9A84C]">
                <Mail className="h-4 w-4 md:h-5 md:w-5 text-[#C9A84C]" />
                {STORE_INFO.email}
              </a>
              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 md:gap-3 hover:text-[#C9A84C]"
              >
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-[#C9A84C]" />
                {STORE_INFO.address}
              </a>
              <p className="flex items-center gap-2 md:gap-3">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-[#C9A84C]" />
                Night delivery across Kathmandu Valley
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#16110F]/50 p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-white">Delivery Areas</h2>
            <div className="mt-3 md:mt-4 flex flex-wrap gap-1.5 md:gap-2">
              {STORE_INFO.deliveryCities.map((city) => (
                <span key={city} className="rounded-full bg-[#C9A84C]/10 px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold text-[#C9A84C]">
                  {city}
                </span>
              ))}
            </div>
          </div>

          <a
            href={STORE_INFO.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 md:px-5 py-3 md:py-4 text-xs md:text-sm font-semibold text-[#C9A84C] hover:bg-[#C9A84C]/20"
          >
            <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
            Chat on WhatsApp
          </a>

          <div className="h-48 md:h-56 overflow-hidden rounded-2xl border border-white/5">
            <iframe
              title="Jhyaap Station Location"
              src={STORE_INFO.mapsEmbedUrl}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/5 bg-[#16110F]/50 p-4 md:p-6 sm:p-8">
          <h2 className="text-base md:text-lg font-bold text-white">Send a Message</h2>
          <p className="mt-1.5 md:mt-2 text-xs md:text-sm text-[#888888]">We typically respond during service hours.</p>

          {submitted ? (
            <div className="mt-6 md:mt-8 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/10 p-4 md:p-5 text-xs md:text-sm text-[#DDDDDD]">
              Thank you for reaching out. Our team will get back to you shortly.
            </div>
          ) : (
            <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 md:mb-1.5 block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#888888]">
                  Name
                </label>
                <input id="name" name="name" required className="input-field w-full text-xs md:text-sm" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1 md:mb-1.5 block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#888888]">
                  Phone
                </label>
                <input id="phone" name="phone" required className="input-field w-full text-xs md:text-sm" placeholder="+977 ..." />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 md:mb-1.5 block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#888888]">
                  Email
                </label>
                <input id="email" name="email" type="email" className="input-field w-full text-xs md:text-sm" placeholder="you@email.com" />
              </div>
              <div>
                <label htmlFor="message" className="mb-1 md:mb-1.5 block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#888888]">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="input-field w-full resize-none text-xs md:text-sm"
                  placeholder="How can we help?"
                />
              </div>
              <button type="submit" className="btn-primary inline-flex w-full items-center justify-center gap-2 text-xs md:text-sm">
                <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Send Message
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
