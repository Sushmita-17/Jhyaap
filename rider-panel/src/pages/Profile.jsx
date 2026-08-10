import { useAuthStore } from '../store/authStore'
import AvailabilitySwitch from '../components/AvailabilitySwitch'
import {
  Star,
  Bike,
  Phone,
  Mail,
  ShieldCheck,
  User,
  CreditCard,
  FileText,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  ChevronRight,
  IdCard,
  Car,
  Landmark,
} from 'lucide-react'

export default function Profile() {
  const { rider, isAvailable } = useAuthStore()

  if (!rider) return <div className="rider-page p-6 text-gray-400 text-sm">Not logged in</div>

  const completion = [
    { label: 'Personal Information', done: true },
    { label: 'Vehicle Details', done: true },
    { label: 'Documents Verified', done: true },
    { label: 'Bank Details', done: true },
    { label: 'Profile Photo', done: false },
  ]
  const percent = Math.round((completion.filter((c) => c.done).length / completion.length) * 100)

  const sections = [
    {
      title: 'Rider Information',
      icon: User,
      fields: [
        { label: 'Rider ID', value: rider.id || '—' },
        { label: 'Vehicle Type', value: rider.vehicle_type || 'Scooter' },
        { label: 'License Number', value: rider.license_number || 'BA 1 Kha 2345' },
        { label: 'Rating', value: rider.rating ? Number(rider.rating).toFixed(1) : '4.8' },
        { label: 'Account Status', value: isAvailable ? 'Active' : 'Inactive' },
      ],
    },
    {
      title: 'Vehicle Information',
      icon: Car,
      fields: [
        { label: 'Vehicle Type', value: rider.vehicle_type || 'Scooter' },
        { label: 'Registration Number', value: rider.vehicle_number || 'BA 1 Kha 2345' },
        { label: 'Brand / Model', value: rider.vehicle_model || '—' },
        { label: 'Vehicle Color', value: rider.vehicle_color || '—' },
        { label: 'Registration Expiry', value: '2025-12-31' },
      ],
    },
    {
      title: 'Documents',
      icon: FileText,
      fields: [
        { label: 'Citizenship / ID', value: 'Verified' },
        { label: 'Driving License', value: 'Verified' },
        { label: 'Vehicle Registration', value: 'Verified' },
        { label: 'Insurance', value: 'Verified' },
        { label: 'Verification Status', value: 'Approved' },
      ],
    },
    {
      title: 'Bank & Payment',
      icon: Landmark,
      fields: [
        { label: 'Bank Name', value: rider.bank_name || 'NMB Bank' },
        { label: 'Account Holder', value: rider.name && rider.name !== 'undefined' && rider.name.trim() ? rider.name : '—' },
        { label: 'Account Number', value: rider.account_number ? maskAccount(rider.account_number) : '•••• •••• 4521' },
        { label: 'Payment Method', value: 'Bank Transfer' },
        { label: 'Verification Status', value: 'Verified' },
      ],
    },
    {
      title: 'Emergency Contact',
      icon: AlertTriangle,
      fields: [
        { label: 'Name', value: rider.emergency_name || '—' },
        { label: 'Relationship', value: rider.emergency_relationship || '—' },
        { label: 'Phone', value: rider.emergency_phone || '—' },
      ],
    },
  ]

  function maskAccount(num) {
    const s = String(num)
    return s.length > 4 ? '•••• •••• ' + s.slice(-4) : s
  }

  return (
    <div className="rider-page pb-24 lg:pb-8">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight mb-1">My Profile</h1>
          <p className="text-xs text-gray-400">Manage your account and information</p>
        </div>
        <AvailabilitySwitch />
      </header>

      {/* Profile Hero Card */}
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-[#C9A84C]/30 bg-gradient-to-br from-[#C9A84C]/25 via-[#C9A84C]/5 to-transparent p-5 shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#C9A84C]/20 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8a6410] text-2xl font-black text-[#0F0B08] shadow-xl">
            {(rider.name && rider.name !== 'undefined' && rider.name.trim() ? rider.name : 'Rider')[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold">{rider.name && rider.name !== 'undefined' && rider.name.trim() ? rider.name : 'Rider'}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <Bike className="h-3 w-3" />
                {rider.vehicle_type || 'Scooter'}
                {rider.vehicle_number ? ` • ${rider.vehicle_number}` : ''}
              </span>
              <span className="inline-flex items-center gap-1 text-amber-400">
                <Star className="h-3 w-3 fill-amber-400" />
                {rider.rating ? Number(rider.rating).toFixed(1) : '4.8'}
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                {isAvailable ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Contact</p>
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-[#C9A84C]" />
            <span className="text-gray-300">{rider.phone_number || rider.phone || '—'}</span>
          </div>
          {rider.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-[#C9A84C]" />
              <span className="truncate text-gray-300">{rider.email}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-[#C9A84C]" />
            <span className="text-gray-300">{rider.address || 'Kathmandu, Nepal'}</span>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Profile Completion</p>
          <span className="rounded-full bg-[#C9A84C]/15 px-2.5 py-1 text-xs font-bold text-[#C9A84C]">{percent}%</span>
        </div>
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#D9B85C]" style={{ width: `${percent}%` }} />
        </div>
        <ul className="space-y-1.5 text-xs text-gray-400">
          {completion.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              {item.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-amber-400" />
              )}
              {item.label}
              {!item.done && <ChevronRight className="h-3.5 w-3.5 text-amber-400" />}
            </li>
          ))}
        </ul>
        <button className="mt-4 w-full rounded-xl bg-[#C9A84C] px-4 py-2.5 text-sm font-bold text-[#0F0B08] transition hover:bg-[#D9B85C]">
          Complete Profile
        </button>
      </div>

      {/* Info Sections */}
      {sections.map((section) => {
        const Icon = section.icon
        return (
          <div key={section.title} className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Icon className="h-4 w-4 text-[#C9A84C]" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{section.title}</p>
            </div>
            <div className="space-y-2.5">
              {section.fields.map((field) => (
                <div key={field.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500">{field.label}</span>
                  <span className="text-right text-gray-300">{field.value}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
