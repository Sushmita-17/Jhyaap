import { useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useAuthStore, authActions } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { User, Bell, Languages, Moon, Shield, Lock, LogOut } from 'lucide-react'

export default function Settings() {
  const { rider } = useAuthStore()
  const navigate = useNavigate()
  const [notifPreferences, setNotifPreferences] = useState({
    newOrders: true,
    orderUpdates: true,
    payments: true,
    promotions: false,
  })
  const [language, setLanguage] = useState('English')

  const handleLogout = async () => {
    await authActions.logout()
    navigate('/login')
  }

  const togglePref = (key) => {
    setNotifPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Account Information', desc: rider?.name && rider.name !== 'undefined' && rider.name.trim() ? rider.name : 'Edit your personal details' },
      ],
    },
    {
      title: 'Notification Preferences',
      items: [
        { icon: Bell, label: 'New Order Alerts', desc: 'Notify when orders are available', isToggle: 'newOrders' },
        { icon: Bell, label: 'Order Updates', desc: 'Notify on delivery progress', isToggle: 'orderUpdates' },
        { icon: Bell, label: 'Payments', desc: 'Notify on earnings and payments', isToggle: 'payments' },
        { icon: Bell, label: 'Promotions', desc: 'Receive promo and offers', isToggle: 'promotions' },
      ],
    },
    {
      title: 'Appearance & Language',
      items: [
        { icon: Languages, label: 'Language', desc: language, isSelect: true },
        { icon: Moon, label: 'Dark Mode', desc: 'Toggle light / dark theme', isTheme: true },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        { icon: Shield, label: 'Privacy', desc: 'Manage your data and privacy settings' },
        { icon: Lock, label: 'Change Password', desc: 'Update your password' },
      ],
    },
  ]

  return (
    <div className="rider-page pb-24 lg:pb-8">
      <header className="mb-6">
        <h1 className="text-lg font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-xs text-gray-400">Manage your app preferences</p>
      </header>

      {sections.map((section) => (
        <section key={section.title} className="mb-6">
          <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            {section.title}
          </h2>
          <div className="rider-card divide-y divide-white/5">
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/15 text-[#C9A84C]">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  {item.isToggle && (
                    <button
                      onClick={() => togglePref(item.isToggle)}
                      className={`relative h-6 w-12 shrink-0 rounded-full p-1 transition ${
                        notifPreferences[item.isToggle] ? 'bg-[#C9A84C]' : 'bg-[#2a221c]'
                      }`}
                      aria-label={item.label}
                      aria-pressed={notifPreferences[item.isToggle]}
                    >
                      <div
                        className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          notifPreferences[item.isToggle] ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  )}
                  {item.isTheme && <ThemeToggle />}
                  {item.isSelect && (
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-gray-300 outline-none focus:border-[#C9A84C]"
                    >
                      <option value="English" className="bg-[#1a1512]">English</option>
                      <option value="नेपाली" className="bg-[#1a1512]">नेपाली</option>
                    </select>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  )
}
