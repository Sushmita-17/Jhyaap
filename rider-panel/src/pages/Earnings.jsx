import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { earningsActions } from '../store/earningsStore'
import EarningsSummaryCard from '../components/EarningsSummaryCard'
import { Wallet, Download, CalendarClock, TrendingUp, PackageCheck, Banknote } from 'lucide-react'
import {
  getTodayRange,
  getCurrentWeekRange,
  getCurrentMonthRange,
  getLast3MonthsRange,
  groupByDay,
  groupByWeek,
  getDayName,
  getShortDayName,
} from '../utils/dateUtils'
import { downloadCSV, calculateTotal, formatCurrency, formatDate, formatTime } from '../utils/earningsExport'

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001'

export default function Earnings() {
  const [view, setView] = useState('daily') // 'daily' | 'weekly' | 'monthly'
  const [earnings, setEarnings] = useState([])
  const [loading, setLoading] = useState(false)
  const [downloadMode, setDownloadMode] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [cashOnHand, setCashOnHand] = useState(0)

  const { rider, loading: authLoading } = useAuthStore()

  const fetchEarnings = async () => {
    if (!rider?.id) return
    setLoading(true)
    try {
      const token = localStorage.getItem('jhyaap_rider_token')
      const { start, end } = getLast3MonthsRange()
      
      // Fetch earnings from backend
      const earningsResponse = await fetch(
        `${BACKEND_API_URL}/api/v1/earnings/rider/${rider.id}?start_date=${start.toISOString()}&end_date=${end.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (earningsResponse.ok) {
        const earningsData = await earningsResponse.json()
        setEarnings(earningsData || [])
      }

      // Fetch cash on hand from backend
      const cashResponse = await fetch(
        `${BACKEND_API_URL}/api/v1/earnings/rider/${rider.id}/cash-on-hand`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (cashResponse.ok) {
        const cashData = await cashResponse.json()
        setCashOnHand(cashData.cash_on_hand || 0)
      }
    } catch (err) {
      console.error('Error fetching earnings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (rider?.id) fetchEarnings()
  }, [rider?.id])

  const handleDownloadStatement = async () => {
    if (!customStartDate || !customEndDate) {
      alert('Please select both start and end dates')
      return
    }

    const start = new Date(customStartDate)
    const end = new Date(customEndDate)

    if (start > end) {
      alert('Start date must be before end date')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('jhyaap_rider_token')
      
      const response = await fetch(
        `${BACKEND_API_URL}/api/v1/earnings/rider/${rider.id}?start_date=${start.toISOString()}&end_date=${end.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const filename = `Earnings_${formatDate(start)}_to_${formatDate(end)}.csv`
        downloadCSV(data, filename)
        setDownloadMode(false)
        setCustomStartDate('')
        setCustomEndDate('')
      } else {
        throw new Error('Failed to fetch earnings data')
      }
    } catch (err) {
      console.error('Error downloading statement:', err)
      alert('Failed to generate statement. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderDailyView = () => {
    const { start, end } = getTodayRange()
    const today = earnings.filter(
      (e) => new Date(e.earned_at) >= start && new Date(e.earned_at) < end
    )

    return (
<div>
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-[#C9A84C]/40 bg-gradient-to-br from-[#C9A84C]/30 via-[#C9A84C]/10 to-transparent p-5 shadow-lg">
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#C9A84C]/20 blur-2xl" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#C9A84C]">
              <Wallet className="h-3.5 w-3.5" />
              Today's Earnings
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-[#C9A84C]">{formatCurrency(calculateTotal(today))}</p>
            <p className="mt-1 text-xs text-gray-500">{today.length} deliveries completed</p>
            <div className="mt-4 flex items-center justify-between border-t border-[#C9A84C]/20 pt-3">
              <span className="text-xs text-gray-400">Cash on hand</span>
              <span className="text-lg font-bold text-[#F5ECD7]">{formatCurrency(cashOnHand)}</span>
            </div>
          </div>
        </div>

        {today.length === 0 ? (
          <div className="rider-card p-4 text-center">
            <p className="text-sm text-gray-400">No deliveries completed today yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {today.map((earning) => (
              <div
                key={earning.id}
                className="rider-card p-3 flex items-center justify-between hover:border-[#C9A84C] transition"
              >
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{formatTime(earning.earned_at)}</p>
                  <p className="text-sm text-gray-300">Order #{earning.order_id.slice(0, 8)}</p>
                </div>
                <p className="text-sm font-semibold text-[#C9A84C] shrink-0 ml-2">
                  +{formatCurrency(earning.delivery_fee)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderWeeklyView = () => {
    const { start, end } = getCurrentWeekRange()
    const thisWeek = earnings.filter(
      (e) => new Date(e.earned_at) >= start && new Date(e.earned_at) < end
    )
    const grouped = groupByDay(thisWeek)

    return (
<div>
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-[#C9A84C]/40 bg-gradient-to-br from-[#C9A84C]/30 via-[#C9A84C]/10 to-transparent p-5 shadow-lg">
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#C9A84C]/20 blur-2xl" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#C9A84C]">
              <CalendarClock className="h-3.5 w-3.5" />
              This Week
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-[#C9A84C]">{formatCurrency(calculateTotal(thisWeek))}</p>
            <p className="mt-1 text-xs text-gray-500">{thisWeek.length} deliveries completed</p>
          </div>
        </div>

        {thisWeek.length === 0 ? (
          <div className="rider-card p-4 text-center">
            <p className="text-sm text-gray-400">No deliveries this week yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(grouped)
              .sort()
              .reverse()
              .map(([date, dayEarnings]) => (
                <div key={date} className="rider-card p-3">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#2a221c]">
                    <p className="text-sm font-semibold text-gray-300">
                      {getDayName(new Date(date))}
                    </p>
                    <p className="text-sm text-[#C9A84C] font-semibold">
                      {formatCurrency(calculateTotal(dayEarnings))}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {dayEarnings.map((earning) => (
                      <div
                        key={earning.id}
                        className="flex justify-between text-xs text-gray-400"
                      >
                        <span>{formatTime(earning.earned_at)}</span>
                        <span>+{formatCurrency(earning.delivery_fee)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    )
  }

  const renderMonthlyView = () => {
    const { start, end } = getCurrentMonthRange()
    const thisMonth = earnings.filter(
      (e) => new Date(e.earned_at) >= start && new Date(e.earned_at) < end
    )
    const grouped = groupByDay(thisMonth)

    return (
<div>
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-[#C9A84C]/40 bg-gradient-to-br from-[#C9A84C]/30 via-[#C9A84C]/10 to-transparent p-5 shadow-lg">
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#C9A84C]/20 blur-2xl" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#C9A84C]">
              <CalendarClock className="h-3.5 w-3.5" />
              This Month
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-[#C9A84C]">{formatCurrency(calculateTotal(thisMonth))}</p>
            <p className="mt-1 text-xs text-gray-500">{thisMonth.length} deliveries completed</p>
          </div>
        </div>

        {thisMonth.length === 0 ? (
          <div className="rider-card p-4 text-center">
            <p className="text-sm text-gray-400">No deliveries this month yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(grouped)
              .sort()
              .reverse()
              .map(([date, dayEarnings]) => (
                <div
                  key={date}
                  className="rider-card p-3 flex items-center justify-between hover:border-[#C9A84C] transition"
                >
                  <div>
                    <p className="text-xs text-gray-500">{date}</p>
                    <p className="text-xs text-gray-400">{dayEarnings.length} deliveries</p>
                  </div>
                  <p className="text-sm font-semibold text-[#C9A84C]">
                    {formatCurrency(calculateTotal(dayEarnings))}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    )
  }

  if (authLoading) {
    return <div className="rider-page p-6 text-gray-400 text-sm">Initializing...</div>
  }

const { start: todayStart, end: todayEnd } = getTodayRange()
  const { start: weekStart, end: weekEnd } = getCurrentWeekRange()
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange()

  const todayList = earnings.filter((e) => new Date(e.earned_at) >= todayStart && new Date(e.earned_at) < todayEnd)
  const weekList = earnings.filter((e) => new Date(e.earned_at) >= weekStart && new Date(e.earned_at) < weekEnd)
  const monthList = earnings.filter((e) => new Date(e.earned_at) >= monthStart && new Date(e.earned_at) < monthEnd)

  const summaryStats = [
    { label: "Today's Earnings", value: formatCurrency(calculateTotal(todayList)), icon: TrendingUp, color: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]/15' },
    { label: 'This Week', value: formatCurrency(calculateTotal(weekList)), icon: CalendarClock, color: 'text-blue-500', bg: 'bg-blue-500/15' },
    { label: 'This Month', value: formatCurrency(calculateTotal(monthList)), icon: PackageCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
    { label: 'Cash on Hand', value: formatCurrency(cashOnHand), icon: Banknote, color: 'text-amber-500', bg: 'bg-amber-500/15' },
  ]

  return (
    <div className="rider-page pb-24 lg:pb-8">
      <header className="mb-6">
        <h1 className="text-lg font-bold tracking-tight mb-1">My Earnings</h1>
        <p className="text-xs text-gray-400">Last 3 months visible in-app</p>
      </header>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {summaryStats.map((stat) => {
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

{/* View Tabs */}
      <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
        {[
          { id: 'daily', label: 'Daily' },
          { id: 'weekly', label: 'Weekly' },
          { id: 'monthly', label: 'Monthly' },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => {
              setView(v.id)
              setDownloadMode(false)
            }}
            className={`rounded-xl px-3 py-2 text-sm font-bold whitespace-nowrap transition ${
              view === v.id
                ? 'bg-[#C9A84C] text-[#0F0B08] shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Download Statement Button */}
      <button
        onClick={() => setDownloadMode(!downloadMode)}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-[#C9A84C] transition hover:border-[#C9A84C]/40 hover:bg-white/10"
      >
        <Download className="h-4 w-4" />
        {downloadMode ? 'Cancel Download' : 'Download Statement'}
      </button>

      {/* Download Mode */}
      {downloadMode && (
        <div className="rider-card p-4 mb-6 space-y-3">
          <p className="text-xs text-gray-400">Select date range (no 3-month limit)</p>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="w-full bg-[#0F0B08] border border-[#2a221c] rounded-md px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#C9A84C]"
          />
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="w-full bg-[#0F0B08] border border-[#2a221c] rounded-md px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#C9A84C]"
          />
          <button
            onClick={handleDownloadStatement}
            disabled={loading}
            className="w-full rider-btn rider-btn-primary text-[#0F0B08] text-sm py-2"
          >
            {loading ? 'Generating...' : 'Download CSV'}
          </button>
        </div>
      )}

      {/* Content */}
      {loading && !downloadMode ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rider-card p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-2/3 mb-3" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {view === 'daily' && renderDailyView()}
          {view === 'weekly' && renderWeeklyView()}
          {view === 'monthly' && renderMonthlyView()}
        </>
      )}
    </div>
  )
}
