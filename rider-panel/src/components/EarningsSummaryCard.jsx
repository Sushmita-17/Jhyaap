import { Wallet, PackageCheck, TrendingUp } from 'lucide-react'
import { calculateTotal, formatCurrency } from '../utils/earningsExport'

export default function EarningsSummaryCard({ earnings = [], period = 'Today' }) {
  const total = calculateTotal(earnings)
  const count = earnings.length

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#C9A84C]/40 bg-gradient-to-br from-[#C9A84C]/30 via-[#C9A84C]/10 to-transparent p-5 shadow-lg">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#C9A84C]/20 blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-[#C9A84C]">
            <Wallet className="h-4 w-4" />
            {period} Earnings
          </div>
          <span className="rounded-full bg-[#C9A84C]/15 px-2.5 py-1 text-[10px] font-bold text-[#C9A84C]">
            LIVE
          </span>
        </div>

        {/* Total earnings */}
        <p className="text-4xl font-extrabold tracking-tight text-[#C9A84C]">
          {formatCurrency(total)}
        </p>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#C9A84C]/20 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/15 text-[#C9A84C]">
              <PackageCheck className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#F5ECD7]">{count}</p>
              <p className="text-[10px] text-gray-400">Total Delivery{count === 1 ? '' : 's'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-emerald-400">100%</p>
              <p className="text-[10px] text-gray-400">Completion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
