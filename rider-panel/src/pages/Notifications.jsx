import { CheckCircle2, FileText, Megaphone, Package, ShieldCheck, Wallet } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001'

const typeConfig = {
  order: { icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/15' },
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
  payment: { icon: Wallet, color: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]/15' },
  verify: { icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/15' },
  doc: { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/15' },
  system: { icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-500/15' },
  rider_acceptance: { icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/15' },
  order_status: { icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
}

export default function Notifications() {
  const { rider } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const unreadCount = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!rider?.id) return
      try {
        const token = localStorage.getItem('jhyaap_rider_token')
        const response = await fetch(
          `${BACKEND_API_URL}/api/v1/notifications/rider/${rider.id}`,
          { headers: token ? { Authorization: 'Bearer ' + token } : {} }
        )
        if (response.ok) {
          const data = await response.json()
          setNotifications(Array.isArray(data) ? data : data.notifications || [])
        } else if (response.status === 404) {
          // Notifications endpoint not implemented - silently ignore
          console.log('Notifications endpoint not available')
          setNotifications([])
        }
      } catch (err) {
        console.error('Error fetching notifications:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [rider?.id])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  if (loading) {
    return (
      <div className="rider-page pb-24 lg:pb-8">
        <header className="mb-6">
          <h1 className="text-lg font-bold tracking-tight mb-1">Notifications</h1>
          <p className="text-xs text-gray-400">Loading...</p>
        </header>
      </div>
    )
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
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const config = typeConfig[notification.notification_type] || typeConfig.system
            const Icon = config.icon
            return (
              <div
                key={notification.id}
                className={`rider-card relative flex items-start gap-3 p-4 ${!notification.is_read ? 'border-[#C9A84C]/40' : ''}`}
              >
                {!notification.is_read && (
                  <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#C9A84C]" />
                )}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{notification.title}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">{notification.message}</p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
