import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  LogOut,
  MapPin,
  Package,
  Phone,
  User,
  Wallet,
  Sparkles,
  Check,
  X,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useAppStore } from '@/store/appStore';
import { useLoyaltyStore, POINTS_TO_RUPEE, POINTS_PER_100_RS } from '@/store/loyaltyStore';

export default function CustomerDashboardPage() {
  const { user, logout, updateProfile, changePassword } = useAuthStore();
  const { addresses, deleteAddress } = useCustomerStore();
  const { getOrders, selectOrder } = useOrdersStore();
  const { setPage } = useAppStore();
  const { getPoints, getTransactions, pointsToRupees } = useLoyaltyStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'loyalty'>('profile');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [notifSms, setNotifSms] = useState(true);
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  // Logged-out users go straight to the sign-in screen — no two-card chooser.
  useEffect(() => {
    if (!user) {
      setPage('login');
    }
  }, [user, setPage]);

  const handleSaveEmail = () => {
    if (newEmail.trim()) {
      updateProfile({ email: newEmail.trim() });
      setEditingEmail(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setPwCurrent('');
    setPwNew('');
    setPwConfirm('');
    setPwError(null);
    setPwSuccess(false);
    setPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setPasswordModalOpen(false);
  };

  const handleUpdatePassword = async () => {
    setPwError(null);

    if (!pwCurrent) {
      setPwError('Enter your current password.');
      return;
    }
    if (pwNew.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError('New passwords don\u2019t match.');
      return;
    }

    setPwLoading(true);
    await new Promise((r) => setTimeout(r, 500)); // TODO: remove once changePassword hits a real API
    const err = changePassword(pwCurrent, pwNew);
    setPwLoading(false);

    if (err) {
      setPwError(err);
      return;
    }

    setPwSuccess(true);
    setPwCurrent('');
    setPwNew('');
    setPwConfirm('');
    setTimeout(() => {
      setPasswordModalOpen(false);
      setPwSuccess(false);
    }, 1200);
  };

  const orders = getOrders();
  const loyaltyPoints = getPoints(user?.id ?? '');
  const loyaltyValue = pointsToRupees(loyaltyPoints);
  const loyaltyHistory = getTransactions(user?.id ?? '');

  const handleLogout = () => {
    logout();
    setPage('home');
  };

  const handleSaveName = () => {
    if (newName.trim()) {
      updateProfile({ name: newName.trim() });
      setEditingName(false);
    }
  };

  if (!user) {
    // Brief flash before the redirect effect fires; avoid rendering the old
    // two-card chooser entirely.
    return null;
  }

  return (
    <div className="min-h-screen bg-night-950 text-night-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button onClick={() => setPage('home')} className="inline-flex items-center gap-2 text-sm text-night-300 hover:text-neon-amber">
            <ChevronLeft className="h-4 w-4" />
            Back to store
          </button>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        <section className="rounded-2xl border border-night-600/40 bg-night-900/70 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-amber text-night-950">
                <span className="text-2xl font-bold">{user.name[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">My account</p>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-sm text-night-400">+977 {user.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-80 sm:grid-cols-3">
              <div className="rounded-xl bg-night-950/50 p-4">
                <Package className="mb-2 h-5 w-5 text-neon-amber" />
                <p className="text-xl font-bold text-white">{orders.length}</p>
                <p className="text-xs text-night-400">Orders</p>
              </div>
              <div className="rounded-xl bg-night-950/50 p-4">
                <Sparkles className="mb-2 h-5 w-5 text-neon-amber" />
                <p className="text-xl font-bold text-white">{loyaltyPoints}</p>
                <p className="text-xs text-night-400">Loyalty pts</p>
              </div>
              <div className="rounded-xl bg-night-950/50 p-4 col-span-2 sm:col-span-1">
                <Wallet className="mb-2 h-5 w-5 text-neon-amber" />
                <p className="text-xl font-bold text-white">Rs {loyaltyValue}</p>
                <p className="text-xs text-night-400">Points value</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-max flex gap-1 overflow-hidden rounded-2xl border border-night-600/40 bg-night-900/70 p-1">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'loyalty', label: 'Loyalty', icon: Sparkles },
              { id: 'addresses', label: 'Addresses', icon: MapPin },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'profile' | 'orders' | 'addresses' | 'loyalty')}
                className={`relative flex-1 whitespace-nowrap rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                  activeTab === id ? 'text-[#F5A623]' : 'text-[#888888]'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                {activeTab === id && <span className="absolute inset-x-4 bottom-2 h-[2px] bg-[#F5A623]" />}
              </button>
            ))}
          </div>
        </div>


        <div className="mt-6">
          {passwordModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Change password</p>
                    <p className="mt-2 text-sm text-night-300">Update your account password for security.</p>
                  </div>
                  <button
                    onClick={handleClosePasswordModal}
                    className="rounded-lg p-2 text-night-300 hover:bg-white/5"
                    aria-label="Close password modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {pwSuccess ? (
                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                    <Check className="h-4 w-4" />
                    Password updated.
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {pwError && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {pwError}
                      </div>
                    )}

                    <div>
                      <p className="mb-2 text-xs font-semibold text-night-400">Current password</p>
                      <input
                        type="password"
                        value={pwCurrent}
                        onChange={(e) => setPwCurrent(e.target.value)}
                        className="input-field w-full"
                        autoFocus
                      />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold text-night-400">New password</p>
                      <input
                        type="password"
                        value={pwNew}
                        onChange={(e) => setPwNew(e.target.value)}
                        placeholder="At least 8 characters"
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold text-night-400">Confirm new password</p>
                      <input
                        type="password"
                        value={pwConfirm}
                        onChange={(e) => setPwConfirm(e.target.value)}
                        className="input-field w-full"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdatePassword}
                        disabled={pwLoading}
                        className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {pwLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {confirmDeleteOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#E54545]">Delete account</p>
                    <p className="mt-2 text-sm" style={{ color: '#E54545' }}>
                      Permanently remove your account and data.
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirmDeleteOpen(false)}
                    className="rounded-lg p-2 text-night-300 hover:bg-white/5"
                    aria-label="Close delete confirmation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <div className="rounded-xl bg-black/20 p-3 text-xs text-night-300">
                    This action cannot be undone.
                  </div>
                  {/* TODO: this is still a UI-only stub. Given this account holds order
                      history and (for alcohol delivery) an age-verified identity, wire
                      this to a real endpoint that requires password or OTP re-confirmation
                      before deleting — don't let a single tap delete an account. */}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDeleteOpen(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // UI-only for now — see TODO above.
                        setConfirmDeleteOpen(false);
                      }}
                      className="flex-1 rounded-[6px] bg-[#E54545] px-[28px] py-[12px] font-bold text-white transition-colors duration-200 hover:bg-[#E54545]/90 active:scale-[0.98]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="grid gap-4 lg:grid-cols-2">

              <div className="rounded-2xl border border-night-600/40 bg-night-900/70 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neon-amber">Profile details</p>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold text-night-400">Name</p>
                    {editingName ? (
                      <div className="flex gap-2">
                        <input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="input-field flex-1"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveName}
                          className="rounded-xl bg-[#F5A623] px-3 py-2 text-night-950 font-bold hover:bg-[#F5A623]/90 transition-colors"
                          aria-label="Save name"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingName(false);
                            setNewName(user.name);
                          }}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10 transition-colors"
                          aria-label="Cancel name edit"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl bg-night-950/50 p-4">
                        <p className="font-medium text-white">{user.name}</p>
                        <button
                          onClick={() => setEditingName(true)}
                          className="rounded-lg p-2 text-night-300 hover:text-[#F5A623]"
                          aria-label="Edit name"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl bg-night-950/50 p-4">
                    <p className="mb-1 text-xs font-semibold text-night-400">Phone</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="flex items-center gap-2 font-medium text-white">
                        <Phone className="h-4 w-4 text-neon-amber" />
                        +977 {user.phone}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#4ADE80]/10 px-2 py-0.5 text-xs font-semibold text-[#4ADE80]">
                        <Check className="h-3.5 w-3.5" /> Verified
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-night-950/50 p-4">
                    <p className="mb-1 text-xs font-semibold text-night-400">Email</p>

                    {editingEmail ? (
                      <div className="flex gap-2">
                        <input
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="input-field flex-1"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEmail}
                          className="rounded-xl bg-[#F5A623] px-3 py-2 text-night-950 font-bold hover:bg-[#F5A623]/90 transition-colors"
                          aria-label="Save email"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingEmail(false);
                            setNewEmail(user.email);
                          }}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10 transition-colors"
                          aria-label="Cancel email edit"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : user.email ? (
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-white break-all">{user.email}</p>
                        <button
                          onClick={() => setEditingEmail(true)}
                          className="rounded-lg p-2 text-night-300 hover:text-[#F5A623]"
                          aria-label="Edit email"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-[#555555] italic">Not added</p>
                        <button
                          onClick={() => setEditingEmail(true)}
                          className="text-[#F5A623] font-semibold hover:underline"
                        >
                          + Add email
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl bg-night-950/50 p-4">
                    <p className="mb-1 text-xs font-semibold text-night-400">Password</p>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">••••••••</p>
                      <button
                        onClick={handleOpenPasswordModal}
                        className="text-[#F5A623] font-semibold hover:underline"
                      >
                        Change password
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-night-600/40 bg-night-900/70 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neon-amber">Account tools</p>
                <div className="space-y-3">
                  <button onClick={() => setActiveTab('orders')} className="w-full rounded-xl bg-night-950/50 p-4 text-left hover:bg-night-800">
                    <p className="font-semibold text-white">View orders</p>
                    <p className="mt-1 text-xs text-night-400">Track recent purchases and delivery progress.</p>
                  </button>
                  <button onClick={() => setActiveTab('addresses')} className="w-full rounded-xl bg-night-950/50 p-4 text-left hover:bg-night-800">
                    <p className="font-semibold text-white">Manage addresses</p>
                    <p className="mt-1 text-xs text-night-400">Review your saved delivery locations.</p>
                  </button>

                  <button
                    onClick={handleOpenPasswordModal}
                    className="w-full rounded-xl bg-night-950/50 p-4 text-left hover:bg-night-800"
                  >
                    <p className="font-semibold text-white">Change password</p>
                    <p className="mt-1 text-xs text-night-400">Update your account password for security.</p>
                  </button>

                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-neon-amber" />
                      <p className="font-semibold text-white">Notification preferences</p>
                    </div>
                    <p className="mt-1 text-xs text-night-400">Choose how you'd like order updates sent.</p>

                    <div className="mt-3 space-y-2">
                      {[
                        { key: 'sms', label: 'SMS', value: notifSms, set: setNotifSms },
                        { key: 'whatsapp', label: 'WhatsApp', value: notifWhatsapp, set: setNotifWhatsapp },
                        { key: 'email', label: 'Email', value: notifEmail, set: setNotifEmail },
                      ].map((t) => (
                        <label key={t.key} className="flex cursor-pointer items-center justify-between rounded-lg bg-night-950/30 px-3 py-2">
                          <span className="text-sm text-white">{t.label}</span>
                          <input type="checkbox" checked={t.value} onChange={(e) => t.set(e.target.checked)} />
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="w-full rounded-xl bg-night-950/50 p-4 text-left hover:bg-night-800"
                  >
                    <p className="font-semibold" style={{ color: '#E54545' }}>Delete account</p>
                    <p className="mt-1 text-xs" style={{ color: '#E54545' }}>Permanently remove your account and data.</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-night-600/40 bg-night-900/70 p-10 text-center">
                  <Package className="mx-auto mb-3 h-10 w-10 text-night-500" />
                  <p className="text-night-300">No orders yet</p>
                </div>
              ) : (
                orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => {
                      selectOrder(order.id);
                      setPage('order-tracking');
                    }}
                    className="w-full rounded-2xl border border-night-600/40 bg-night-900/70 p-4 text-left hover:border-neon-amber/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{order.id}</p>
                        <p className="mt-1 text-xs text-night-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-night-500" />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="rounded-full bg-neon-amber/10 px-3 py-1 text-xs font-semibold capitalize text-neon-amber">
                        {order.status.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-white">NPR {order.total.toLocaleString()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === 'loyalty' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-neon-amber/20 bg-gradient-to-r from-neon-amber/10 to-transparent p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Night Owl Rewards</p>
                <p className="mt-2 text-4xl font-bold text-white">{loyaltyPoints} <span className="text-lg font-medium text-night-400">points</span></p>
                <p className="mt-1 text-sm text-night-300">Worth Rs {loyaltyValue} at checkout</p>
                <p className="mt-4 text-xs text-night-500">
                  Earn {POINTS_PER_100_RS} pt per Rs 100 spent · Redeem {POINTS_TO_RUPEE} pts = Rs 1
                </p>
              </div>

              <div className="rounded-2xl border border-night-600/40 bg-night-900/70 p-5">
                <p className="mb-4 text-sm font-semibold text-white">Points history</p>
                {loyaltyHistory.length === 0 ? (
                  <p className="text-sm text-night-400">Complete a delivery to start earning points.</p>
                ) : (
                  <div className="space-y-3">
                    {loyaltyHistory.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between rounded-xl bg-night-950/50 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{tx.description}</p>
                          <p className="text-xs text-night-500">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`text-sm font-bold ${tx.type === 'earn' ? 'text-green-400' : 'text-neon-rose'}`}>
                          {tx.type === 'earn' ? '+' : '-'}{tx.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="grid gap-3 md:grid-cols-2">
              {addresses.length === 0 ? (
                <div className="rounded-2xl border border-night-600/40 bg-night-900/70 p-10 text-center md:col-span-2">
                  <MapPin className="mx-auto mb-3 h-10 w-10 text-night-500" />
                  <p className="text-night-300">No addresses added</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="rounded-2xl border border-night-600/40 bg-night-900/70 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{addr.label}</p>
                        <p className="mt-1 text-sm text-night-300">{addr.street}, {addr.area}</p>
                        {addr.landmark && <p className="text-xs text-night-500">{addr.landmark}</p>}
                      </div>
                      <button onClick={() => deleteAddress(addr.id)} className="text-xs font-semibold text-red-300 hover:text-red-200">
                        Delete
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-night-400">
                      <span>Delivery Fee: NPR {addr.deliveryFee}</span>
                      {addr.isDefault && <span className="rounded-full bg-neon-amber/10 px-2 py-1 text-neon-amber">Default</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}