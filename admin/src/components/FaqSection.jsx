import { useState } from 'react';
import { ChevronDown, Minus, Plus, ArrowRight } from 'lucide-react';

const faqs = [
  {
    q: 'How do I actually place an order?',
    a: 'Pick your bottles, add them to the cart, and checkout with your address. We call or message to confirm timing — especially for night orders.',
  },
  {
    q: 'Do you deliver after dark?',
    a: "Yes, for many areas in the valley. It depends on where you are and how busy the night is. We'll tell you honestly when we confirm the order.",
  },
  {
    q: "Why do I need to confirm I'm 18+?",
    a: "It's the law, and our riders check ID at the door. We'd rather turn away one order than sell to someone underage.",
  },
  {
    q: 'Can I see where my order is?',
    a: "Once it's placed, check your account for status updates — placed, confirmed, out for delivery, and so on. If something's stuck, WhatsApp us.",
  },
  {
    q: 'Best way to reach you?',
    a: "WhatsApp or call +977 9801001101. Email works too (jhyaapstation@gmail.com), but phone is fastest when you're in a hurry.",
  },
];

export default function FaqSection({ showHeader = true }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="mx-auto max-w-[680px] px-4 py-4 md:py-12">
      {showHeader && (
        <div className="mb-3 md:mb-6 text-left">
          <h2 className="text-[18px] md:text-[28px] font-bold text-white mb-1">Common questions</h2>
          <p className="text-[11px] md:text-[14px] leading-4 md:leading-6 text-[#888888]">
            The stuff people usually ask before their first order.
          </p>
        </div>
      )}

      <div className="flex flex-col">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.q}
              className={`border-[#222222] ${idx === 0 ? 'border-t' : ''} border-b`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-2 md:gap-4 py-[10px] md:py-[16px] text-left group transition-all"
              >
                <p className={`text-[12px] md:text-[15px] font-medium transition-colors ${isOpen ? 'text-gold-primary' : 'text-white group-hover:text-gold-primary'}`}>
                  {item.q}
                </p>
                <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full border border-[#C9A84C]/30 bg-[#1A1A1A] text-[#C9A84C] transition-all hover:bg-[#C9A84C] hover:text-black">
                  {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 md:hidden shrink-0 text-[#888888] transition-transform ${isOpen ? 'rotate-180 text-gold-primary' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="pb-2 pt-1.5 md:pb-4 md:pt-3">
                  <p className="text-[11px] md:text-[14px] leading-[1.4] md:leading-[1.6] text-gold-primary">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 md:mt-4 flex justify-end">
        <button className="flex items-center gap-1 text-[10px] md:text-[13px] font-bold text-gold-primary hover:text-white transition-colors">
          See all FAQs <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
