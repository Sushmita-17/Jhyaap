import { ArrowDownRight, Calendar, TrendingUp, Wallet as WalletIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { getCurrentMonthRange, getCurrentWeekRange, getTodayRange } from '../utils/dateUtils'
import { calculateTotal, formatCurrency } from '../utils/earningsExport'

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001'

export default function Wallet() {
  const { rider } = useAuthStore()
  const [earnings, setEarnings] = useState([])
  const [cashOnHand, setCashOnHand] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchWallet = async () => {
    if (!rider?.id) return
    setLoading(true)
    try {
      const token = localStorage.getItem('jhyaap_rider_token')
      const { start, end } = getLast3Months()
      const res = await fetch(
        `${BACKEND_API_URL}/api/v1/earnings/rider/${rider.id}?start_date=${start.toISOString()}&end_date=${end.toISOString()}`,
        { headers: token ? { Authorization: 'Bearer ' + token } : {} }
      )
      if (res.ok) {
        const data = await res.json()
        setEarnings(Array.isArray(data) ? data : [])
      }
      const cashRes = await fetch(
        `${BACKEND_API_URL}/api/v1/earnings/rider/${rider.id}/cash-on-hand`,
        { headers: token ? { Authorization: 'Bearer ' + token } : {} }
      )
      if (cashRes.ok) {
        const cashData = await cashRes.json()
        setCashOnHand(cashData.cash_on_hand || 0)
      }
    } catch (err) {
      console.error('Error fetching wallet:', err)
    } finally {
      setLoading(false)
    }
  }

  const getLast3Months = () => {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 3)
    return { start, end }
  }

  useEffect(() => {
    fetchWallet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rider?.id])

  const { start: todayStart, end: todayEnd } = getTodayRange()
  const { start: weekStart, end: weekEnd } = getCurrentWeekRange()
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange()

  const todayTotal = earnings.filter((e) => new Date(e.earned_at) >= todayStart && new Date(e.earned_at) < todayEnd)
  const weekTotal = earnings.filter((e) => new Date(e.earned_at) >= weekStart && new Date(e.earned_at) < weekEnd)
  const monthTotal = earnings.filter((e) => new Date(e.earned_at) >= monthStart && new Date(e.earned_at) < monthEnd)
  const allTotal = earnings

  const stats = [
    { label: 'Available Balance', value: formatCurrency(cashOnHand), icon: WalletIcon, color: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]/15' },
    { label: "Today's Earnings", value: formatCurrency(calculateTotal(todayTotal)), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
    { label: "This Week", value: formatCurrency(calculateTotal(weekTotal)), icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/15' },
    { label: 'This Month', value: formatCurrency(calculateTotal(monthTotal)), icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/15' },
  ]

  return (
    <div className="rider-page pb-24 lg:pb-8">
      <header className="mb-6">
        <h1 className="text-lg font-bold tracking-tight mb-1">Wallet</h1>
        <p className="text-xs text-gray-400">Your earnings and transactions</p>
      </header>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rider-card p-4">
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[11px] text-gray-400">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Withdraw */}
      <div className="mb-6 rider-card p-5">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold">Withdraw to Bank</h3>
            <p className="text-xs text-gray-400 mt-1">Cash on hand is already collected. Transfer balance to your bank account.</p>
          </div>
          <button className="rounded-xl bg-[#C9A84C] px-5 py-2.5 text-sm font-bold text-[#0F0B08] transition hover:bg-[#D9B85C]">
            Withdraw
          </button>
        </div>
      </div>

      {/* Transactions */}
      <section>
        <h2 className="mb-3 text-sm font-bold tracking-tight">Transaction History</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rider-card p-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-2/3 mb-3" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : allTotal.length === 0 ? (
          <div className="rider-card p-6 text-center">
            <p className="text-sm text-gray-400">No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...allTotal].reverse().slice(0, 20).map((earning) => (
              <div key={earning.id} className="rider-card flex items-center justify-between p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                    <ArrowDownRight className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Delivery #{String(earning.order_id || earning.id).slice(0, 8)}</p>
                    <p className="text-xs text-gray-400">Completed</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-emerald-500 shrink-0 ml-2">
                  +{formatCurrency(earning.delivery_fee)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
