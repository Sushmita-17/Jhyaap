import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useAppStore } from '@/store/appStore';
import { useLoyaltyStore, POINTS_TO_RUPEE, POINTS_PER_100_RS } from '@/store/loyaltyStore';

export default function CustomerDashboardPage() {
  const { user, logout, updateProfile } = useAuthStore();
  const { addresses, deleteAddress } = useCustomerStore();
  const { getOrders, selectOrder } = useOrdersStore();
  const { setPage } = useAppStore();
  const { getPoints, getTransactions, pointsToRupees } = useLoyaltyStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'loyalty'>('profile');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

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
    return (
      <div className="min-h-screen bg-night-950 text-night-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <button onClick={() => setPage('home')} className="mb-6 inline-flex items-center gap-2 text-sm text-night-300 hover:text-neon-amber">
            <ChevronLeft className="h-4 w-4" />
            Back to store
          </button>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-stretch">
            <section className="rounded-2xl border border-night-600/40 bg-night-900/70 p-6 lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Jhyaap Station account</p>
              <h1 className="mt-2 text-3xl font-bold text-white">Sign in or create your account</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-night-300">
                Save your phone number, delivery addresses, order history, wallet balance, and tracking details for a
                faster checkout next time.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={() => setPage('login')} className="btn-primary inline-flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
                <button onClick={() => setPage('login')} className="btn-secondary inline-flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </button>
              </div>
            </section>

            <aside className="rounded-2xl border border-night-600/40 bg-night-900/70 p-6">
              <ShieldCheck className="mb-4 h-8 w-8 text-neon-amber" />
              <h2 className="text-xl font-bold text-white">Why create an account?</h2>
              <div className="mt-5 space-y-3 text-sm text-night-300">
                <p className="rounded-xl bg-night-950/50 p-4">Track active orders and delivery status.</p>
                <p className="rounded-xl bg-night-950/50 p-4">Reuse saved addresses during checkout.</p>
                <p className="rounded-xl bg-night-950/50 p-4">Keep profile details ready for future purchases.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
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

        <div className="mt-6 flex overflow-hidden rounded-2xl border border-night-600/40 bg-night-900/70 p-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'loyalty', label: 'Loyalty', icon: Sparkles },
            { id: 'addresses', label: 'Addresses', icon: MapPin },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'profile' | 'orders' | 'addresses' | 'loyalty')}
              className={`flex-1 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                activeTab === id ? 'bg-neon-amber text-night-950' : 'text-night-300 hover:bg-night-800 hover:text-white'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === 'profile' && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-night-600/40 bg-night-900/70 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neon-amber">Profile details</p>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold text-night-400">Name</p>
                    {editingName ? (
                      <div className="flex gap-2">
                        <input value={newName} onChange={(e) => setNewName(e.target.value)} className="input-field flex-1" autoFocus />
                        <button onClick={handleSaveName} className="btn-primary px-4 py-2">Save</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl bg-night-950/50 p-4">
                        <p className="font-medium text-white">{user.name}</p>
                        <button onClick={() => setEditingName(true)} className="rounded-lg p-2 text-night-300 hover:bg-night-800 hover:text-white">
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl bg-night-950/50 p-4">
                    <p className="mb-1 text-xs font-semibold text-night-400">Phone</p>
                    <p className="flex items-center gap-2 font-medium text-white">
                      <Phone className="h-4 w-4 text-neon-amber" />
                      +977 {user.phone}
                    </p>
                  </div>
                  <div className="rounded-xl bg-night-950/50 p-4">
                    <p className="mb-1 text-xs font-semibold text-night-400">Email</p>
                    <p className="font-medium text-white">{user.email}</p>
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
