import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How do I actually place an order?',
    a: 'Pick your bottles, add them to the cart, and checkout with your address. We call or message to confirm timing — especially for night orders.',
  },
  {
    q: 'Do you deliver after dark?',
    a: 'Yes, for many areas in the valley. It depends on where you are and how busy the night is. We’ll tell you honestly when we confirm the order.',
  },
  {
    q: 'Why do I need to confirm I’m 18+?',
    a: 'It’s the law, and our riders check ID at the door. We’d rather turn away one order than sell to someone underage.',
  },
  {
    q: 'Can I see where my order is?',
    a: 'Once it’s placed, check your account for status updates — placed, confirmed, out for delivery, and so on. If something’s stuck, WhatsApp us.',
  },
  {
    q: 'Best way to reach you?',
    a: 'WhatsApp or call +977 9801001101. Email works too (jhyaapstation@gmail.com), but phone is fastest when you’re in a hurry.',
  },
];

interface FaqSectionProps {
  showHeader?: boolean;
}

export default function FaqSection({ showHeader = true }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-[680px] px-4 py-12">
      {showHeader && (
        <div className="mb-6 text-left">
          <h2 className="text-[28px] font-bold text-white mb-1">Common questions</h2>
          <p className="text-[14px] leading-6 text-[#888888]">
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
                className="flex w-full items-center justify-between gap-4 py-[16px] text-left group transition-all"
              >
                <p className={`text-[15px] font-medium transition-colors ${isOpen ? 'text-gold-primary' : 'text-white group-hover:text-gold-primary'}`}>
                  {item.q}
                </p>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-[#888888] transition-transform ${isOpen ? 'rotate-180 text-gold-primary' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="pb-4 pt-3">
                  <p className="text-[14px] leading-[1.6] text-gold-primary">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <button className="text-[13px] font-bold text-gold-primary hover:text-white transition-colors">
          See all FAQs →
        </button>
      </div>
    </section>
  );
}
