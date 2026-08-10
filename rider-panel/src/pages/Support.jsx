import { useState } from 'react'
import { BookOpen, Phone, MessageCircle, AlertTriangle, LifeBuoy, ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'How do I accept an order?', a: 'When a new order is available, tap the order card and press "Accept Order".' },
  { q: 'How do I mark an order as delivered?', a: 'Navigate to the order, tap "Start Delivery", and follow the progress. Once delivered, collect payment.' },
  { q: 'How do I go offline?', a: 'Use the Availability switch in the top-right of the header to toggle your availability.' },
  { q: 'How do I withdraw my earnings?', a: 'Go to Wallet and tap "Withdraw" to transfer your balance to your bank account.' },
  { q: 'What if a customer is not available?', a: 'Call the customer using the "Call Customer" button. If unreachable, contact support for assistance.' },
]

const supportOptions = [
  { label: 'Help Center', icon: BookOpen, desc: 'Browse guides and documentation' },
  { label: 'Contact Support', icon: Phone, desc: 'Call our support team' },
  { label: 'Live Chat', icon: MessageCircle, desc: 'Chat with an agent' },
  { label: 'Report a Problem', icon: AlertTriangle, desc: 'Report an issue with your order or app' },
]

export default function Support() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="rider-page pb-24 lg:pb-8">
      <header className="mb-6">
        <h1 className="text-lg font-bold tracking-tight mb-1">Support</h1>
        <p className="text-xs text-gray-400">We are here to help</p>
      </header>

      {/* Hero */}
      <div className="mb-6 relative overflow-hidden rounded-2xl border border-[#C9A84C]/40 bg-gradient-to-br from-[#C9A84C]/25 via-[#C9A84C]/5 to-transparent p-5 shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#C9A84C]/20 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A84C]/20 text-[#C9A84C]">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold">Jhyaap Rider Support</h2>
            <p className="text-xs text-gray-400">Available 24/7 for our riders</p>
          </div>
        </div>
      </div>

      {/* Support Options */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {supportOptions.map((option) => {
          const Icon = option.icon
          return (
            <button
              key={option.label}
              className="rider-card flex items-center gap-3 p-4 text-left transition hover:border-[#C9A84C]/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/15 text-[#C9A84C]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="text-xs text-gray-400">{option.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Emergency */}
      <div className="mb-6 rider-card border-red-500/30 p-4">
        <p className="text-sm font-bold text-red-400 mb-1">Emergency Help</p>
        <p className="text-xs text-gray-400 mb-3">For emergencies, contact Jhyaap at</p>
        <a
          href="tel:+977XXXXXXXXXX"
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500"
        >
          <Phone className="h-4 w-4" /> Call Emergency Support
        </a>
      </div>

      {/* FAQs */}
      <section>
        <h2 className="mb-3 text-sm font-bold tracking-tight">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="rider-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <span className="text-sm font-semibold">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#C9A84C] transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index && (
                <p className="px-4 pb-4 text-sm text-gray-400">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
