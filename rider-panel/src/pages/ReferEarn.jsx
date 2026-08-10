import { useState } from 'react'
import { Gift, Copy, Share2, Users, TrendingUp, Check } from 'lucide-react'

const referralHistory = [
  { id: 1, name: 'Sita Sharma', joined: '2 weeks ago', status: 'Active' },
  { id: 2, name: 'Ram Karki', joined: '1 month ago', status: 'Active' },
  { id: 3, name: 'Anita Gurung', joined: '2 months ago', status: 'Pending' },
]

export default function ReferEarn() {
  const [copied, setCopied] = useState(false)
  const referralCode = 'JHYAAP-RAJESH-2024'

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    const text = `Join Jhyaap as a rider and earn rewards! Use my referral code ${referralCode}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Jhyaap Referral', text })
      } catch (err) {
        console.error('Share canceled:', err)
      }
    } else {
      copyCode()
    }
  }

  return (
    <div className="rider-page pb-24 lg:pb-8">
      <header className="mb-6">
        <h1 className="text-lg font-bold tracking-tight mb-1">Refer & Earn</h1>
        <p className="text-xs text-gray-400">Invite friends and earn rewards</p>
      </header>

      {/* Hero */}
      <div className="mb-6 relative overflow-hidden rounded-2xl border border-[#C9A84C]/40 bg-gradient-to-br from-[#C9A84C]/30 via-[#C9A84C]/10 to-transparent p-5 shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#C9A84C]/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-medium text-[#C9A84C]">
            <Gift className="h-4 w-4" /> Refer and Earn Rewards
          </div>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#C9A84C]">NPR 200</p>
          <p className="mt-1 text-xs text-gray-400">Earn NPR 200 for every rider who joins and completes their first delivery.</p>
        </div>
      </div>

      {/* Referral code */}
      <div className="mb-6 rider-card p-5">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">Your Referral Code</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-xl border border-dashed border-[#C9A84C]/50 bg-[#C9A84C]/5 px-4 py-3 text-center">
            <p className="text-lg font-extrabold tracking-widest text-[#C9A84C]">{referralCode}</p>
          </div>
          <button
            onClick={copyCode}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C] text-[#0F0B08] transition hover:bg-[#D9B85C]"
            aria-label="Copy referral code"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>
        <button
          onClick={handleShare}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-4 py-3 text-sm font-bold text-[#0F0B08] transition hover:bg-[#D9B85C]"
        >
          <Share2 className="h-4 w-4" /> Share Referral
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rider-card p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A84C]/15 text-[#C9A84C]">
            <Users className="h-4.5 w-4.5" />
          </div>
          <p className="text-lg font-bold">{referralHistory.length}</p>
          <p className="text-[11px] text-gray-400">Referrals</p>
        </div>
        <div className="rider-card p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
            <Users className="h-4.5 w-4.5" />
          </div>
          <p className="text-lg font-bold">{referralHistory.filter((r) => r.status === 'Active').length}</p>
          <p className="text-[11px] text-gray-400">Active</p>
        </div>
        <div className="rider-card p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A84C]/15 text-[#C9A84C]">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <p className="text-lg font-bold">NPR {referralHistory.filter((r) => r.status === 'Active').length * 200}</p>
          <p className="text-[11px] text-gray-400">Rewards Earned</p>
        </div>
      </div>

      {/* History */}
      <section>
        <h2 className="mb-3 text-sm font-bold tracking-tight">Referral History</h2>
        {referralHistory.length === 0 ? (
          <div className="rider-card p-6 text-center">
            <p className="text-sm text-gray-400">No referrals yet. Share your code to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referralHistory.map((ref) => (
              <div key={ref.id} className="rider-card flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C9A84C]/15 text-sm font-bold text-[#C9A84C]">
                    {ref.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{ref.name}</p>
                    <p className="text-xs text-gray-400">Joined {ref.joined}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  ref.status === 'Active'
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : 'bg-amber-500/15 text-amber-500'
                }`}>
                  {ref.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
