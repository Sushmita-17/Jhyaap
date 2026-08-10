import { CheckCircle2, FileText, Megaphone, Package, ShieldCheck, Wallet } from 'lucide-react'
import { useState } from 'react'

const initialNotifications = [
  { id: 1, title: 'New delivery available', desc: 'A new order is available near you. Tap to accept.', time: '2 min ago', type: 'order', unread: true },
  { id: 2, title: 'Delivery completed', desc: 'Order #1024 was delivered successfully.', time: '1 hour ago', type: 'success', unread: true },
  { id: 3, title: 'Payment received', desc: 'NPR 150 for delivery #1024 added to your wallet.', time: '1 hour ago', type: 'payment', unread: true },
  { id: 4, title: 'Profile verification', desc: 'Your documents have been verified.', time: '1 day ago', type: 'verify', unread: false },
  { id: 5, title: 'Document expiry', desc: 'Your driving license will expire soon.', time: '2 days ago', type: 'doc', unread: false },
  { id: 6, title: 'System announcement', desc: 'We have updated our delivery guidelines.', time: '3 days ago', type: 'system', unread: false },
]

const typeConfig = {
  order: { icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/15' },
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
  payment: { icon: Wallet, color: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]/15' },
  verify: { icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/15' },
  doc: { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/15' },
  system: { icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-500/15' },
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter((n) => n.unread).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <div className="rider-page pb-24 lg:pb-8">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight mb-1">Notifications</h1>
          <p className="text-xs text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#C9A84C] transition hover:bg-white/10"
          >
            Mark all read
          </button>
        )}
      </header>

      <div className="space-y-2">
        {notifications.map((notification) => {
          const config = typeConfig[notification.type] || typeConfig.system
          const Icon = config.icon
          return (
            <div
              key={notification.id}
              className={`rider-card relative flex items-start gap-3 p-4 ${notification.unread ? 'border-[#C9A84C]/40' : ''}`}
            >
              {notification.unread && (
                <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#C9A84C]" />
              )}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{notification.title}</p>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">{notification.desc}</p>
                <p className="mt-1 text-[11px] text-gray-500">{notification.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
