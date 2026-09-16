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
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerStore } from '@/store/customerStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useAppStore } from '@/store/appStore';
import { useThemeStore } from '@/store/themeStore';
import { useLoyaltyStore, POINTS_TO_RUPEE, POINTS_PER_100_RS } from '@/store/loyaltyStore';
import { requestOtp, verifyOtp } from '@/lib/jhyaapAuthAPI';
import { getBackendCustomerOrders, getDeliveryRating, submitDeliveryRating, changeCustomerPassword, deleteCustomerAccount } from '@/lib/backendAPI';


function DeliveryRatingForm({ order, user, isLight }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getDeliveryRating(order.id).then((result) => {
      if (!active || !result?.rating) return;
      setRating(result.rating);
      setReview(result.review || '');
      setSaved(true);
    }).catch(() => {});
    return () => { active = false; };
  }, [order.id]);

  const saveRating = async () => {
    if (!rating || saving) return;
    setSaving(true);
    try {
      await submitDeliveryRating(order.id, user.id, rating, review);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`mt-2 rounded-2xl border p-3 md:p-4 ${isLight ? 'bg-white border-gray-200' : 'bg-[#141414] border-white/10'}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className={`text-xs md:text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{saved ? 'Your service rating' : 'Rate your delivery'}</p>
          <p className={`mt-1 text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Share your experience with the rider.</p>
        </div>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Delivery rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} star${value > 1 ? 's' : ''}`} className="rounded p-1 transition-transform hover:scale-110">
              <Star className={`h-5 w-5 ${value <= rating ? 'fill-[#C9A84C] text-[#C9A84C]' : isLight ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          ))}
        </div>
      </div>
      {!saved && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input value={review} onChange={(event) => setReview(event.target.value)} placeholder="Optional comment" maxLength={1000} className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-xs outline-none focus:border-[#C9A84C] ${isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-black/30 border-white/10 text-white'}`} />
          <button type="button" disabled={!rating || saving} onClick={saveRating} className="rounded-xl bg-[#C9A84C] px-4 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saving...' : 'Submit rating'}</button>
        </div>
      )}
    </div>
  );
}
export default function CustomerDashboardPage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const { user: authUser, isAuthenticated: authIsAuthenticated, logout: authLogout } = useAuth();
  const { user: storeUser, isAuthenticated: storeIsAuthenticated, logout: storeLogout, updateProfile } = useAuthStore();
  
  // Use auth user if available, otherwise use store user
  const user = authUser || storeUser;
  const isAuthenticated = authIsAuthenticated || storeIsAuthenticated;
  const logout = () => {
    authLogout();
    storeLogout();
  };
  
  const { addresses, deleteAddress } = useCustomerStore();
  const { getOrders, selectOrder, hydrateOrders } = useOrdersStore();
  const { setPage } = useAppStore();
  const { getPoints, getTransactions, pointsToRupees } = useLoyaltyStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(user?.phone || '');

  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [notifSms, setNotifSms] = useState(true);
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  const fetchOrders = useCallback(() => {
    if (!user?.id) return;
    getBackendCustomerOrders(user.id)
      .then((remoteOrders) => {
        if (!Array.isArray(remoteOrders)) return;
        hydrateOrders(remoteOrders.map((order) => ({
          ...order,
          status: order.status === 'pending' ? 'placed' : order.status,
          userId: order.customer_id,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          address: {
            label: 'Delivery address',
            area: order.delivery_address || 'Kathmandu',
            street: order.delivery_address || '',
          },
          destinationCoords: null,
          deliveryRider: null,
        })));
      })
      .catch(() => {});
  }, [user?.id, hydrateOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refresh orders when page becomes visible (e.g., after placing order)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchOrders]);
  // Logged-out users go straight to the sign-in screen — no two-card chooser.
  useEffect(() => {
    if (!user) {
      setPage('login');
    }
  }, [user, setPage]);

  // Close whichever modal is open on Escape.
  useEffect(() => {
    if (!passwordModalOpen && !confirmDeleteOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPasswordModalOpen(false);
        setConfirmDeleteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [passwordModalOpen, confirmDeleteOpen]);

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
    try {
      const token = localStorage.getItem('jhyaap_access_token');
      if (!token || !user?.id) throw new Error('Please sign in again before changing your password.');
      await changeCustomerPassword(user.id, pwCurrent, pwNew, token);
    } catch (error) {
      setPwLoading(false);
      setPwError(error.message || 'Unable to update password.');
      return;
    }
    setPwLoading(false);

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

  const handleSavePhone = () => {
    if (newPhone.trim()) {
      updateProfile({ phone: newPhone.trim() });
      setEditingPhone(false);
    }
  };

  if (!user) {
    // Brief flash before the redirect effect fires; avoid rendering the old
    // two-card chooser entirely.
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isLight ? 'bg-gray-50 text-gray-900' : 'bg-[#0A0A0A] text-[#F5ECD7]'}`}>
      <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="mb-4 md:mb-6 flex items-center justify-between gap-2 md:gap-3">
          <button onClick={() => setPage('home')} className={`inline-flex items-center gap-2 text-xs md:text-sm transition-colors ${isLight ? 'text-gray-500 hover:text-gold-primary' : 'text-[#888888] hover:text-[#C9A84C]'}`}>
            <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Back to store
          </button>
          <button onClick={handleLogout} className={`inline-flex items-center gap-1.5 md:gap-2 rounded-xl border px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm transition-colors ${isLight ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-red-500/30 text-red-300 hover:bg-red-500/10'}`}>
            <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Logout
          </button>
        </div>

        <section className={`rounded-2xl border p-4 md:p-6 transition-colors ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#0A0A0A] border-white/10'}`}>
          <div className="flex flex-col gap-4 md:gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-[#C9A84C] text-black shadow-lg">
                <span className="text-xl md:text-2xl font-bold">{user.name[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">My account</p>
                <h1 className={`text-lg md:text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{user.name}</h1>
                <p className={`text-xs md:text-sm ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>+977 {user.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-3 sm:min-w-80 sm:grid-cols-3">
              <div className={`rounded-xl p-3 md:p-4 transition-colors ${isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]/50'}`}>
                <Package className="mb-1.5 md:mb-2 h-4 w-4 md:h-5 md:w-5 text-[#C9A84C]" />
                <p className={`text-lg md:text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{orders.length}</p>
                <p className={`text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Orders</p>
              </div>
              <div className={`rounded-xl p-3 md:p-4 transition-colors ${isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]/50'}`}>
                <Sparkles className="mb-1.5 md:mb-2 h-4 w-4 md:h-5 md:w-5 text-[#C9A84C]" />
                <p className={`text-lg md:text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{loyaltyPoints}</p>
                <p className={`text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Loyalty pts</p>
              </div>
              <div className={`col-span-2 rounded-xl p-3 md:p-4 sm:col-span-1 transition-colors ${isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]/50'}`}>
                <Wallet className="mb-1.5 md:mb-2 h-4 w-4 md:h-5 md:w-5 text-[#C9A84C]" />
                <p className={`text-lg md:text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Rs {loyaltyValue}</p>
                <p className={`text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Points value</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 md:mt-6 overflow-x-auto pb-1">
          <div className={`min-w-max flex gap-1 overflow-hidden rounded-2xl border p-1 transition-colors ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A0A0A] border-white/10'}`}>
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'loyalty', label: 'Loyalty', icon: Sparkles },
              { id: 'addresses', label: 'Addresses', icon: MapPin },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex-1 whitespace-nowrap rounded-xl px-2 md:px-3 py-2 md:py-3 text-xs md:text-sm font-semibold transition-all ${
                  activeTab === id 
                    ? 'text-[#C9A84C]' 
                    : isLight ? 'text-gray-500 hover:bg-gray-50 hover:text-gray-900' : 'text-[#888888] hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="inline-flex items-center gap-1.5 md:gap-2">
                  <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {label}
                </span>
                {activeTab === id && <span className="absolute inset-x-3 md:inset-x-4 bottom-1.5 md:bottom-2 h-[2px] bg-[#C9A84C] rounded-full" />}
              </button>
            ))}
          </div>
        </div>


        <div className="mt-4 md:mt-6">
          {passwordModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-opacity"
              onClick={handleClosePasswordModal}
            >
              <div
                className={`w-full max-w-md rounded-2xl border p-4 md:p-6 shadow-2xl transition-all ${isLight ? 'bg-white border-gray-100' : 'bg-[#141414] border-white/10'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-2 md:gap-3">
                  <div>
                    <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Change password</p>
                    <p className={`mt-1.5 md:mt-2 text-xs md:text-sm ${isLight ? 'text-gray-600' : 'text-[#DDDDDD]'}`}>Update your account password for security.</p>
                  </div>
                  <button
                    onClick={handleClosePasswordModal}
                    className={`rounded-lg p-1.5 md:p-2 transition-colors ${isLight ? 'text-gray-500 hover:bg-gray-100' : 'text-[#888888] hover:bg-white/5'}`}
                    aria-label="Close password modal"
                  >
                    <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </button>
                </div>

                {pwSuccess ? (
                  <div className="mt-4 md:mt-5 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-green-500 font-medium">
                    <Check className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Password updated.
                  </div>
                ) : (
                  <div className="mt-4 md:mt-5 space-y-3 md:space-y-4">
                    {pwError && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-red-500 font-medium">
                        {pwError}
                      </div>
                    )}

                    <div>
                      <p className={`mb-1.5 md:mb-2 text-[10px] md:text-xs font-semibold ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Current password</p>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={pwCurrent}
                          onChange={(e) => setPwCurrent(e.target.value)}
                          className={`w-full rounded-xl border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] transition-colors ${isLight ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white' : 'bg-black/50 border-white/10 text-white placeholder-gray-500 focus:bg-black/70'}`}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-500 hover:text-gray-700' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className={`mb-1.5 md:mb-2 text-[10px] md:text-xs font-semibold ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>New password</p>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={pwNew}
                          onChange={(e) => setPwNew(e.target.value)}
                          placeholder="At least 8 characters"
                          className={`w-full rounded-xl border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] transition-colors ${isLight ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white' : 'bg-black/50 border-white/10 text-white placeholder-gray-500 focus:bg-black/70'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-500 hover:text-gray-700' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className={`mb-1.5 md:mb-2 text-[10px] md:text-xs font-semibold ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Confirm new password</p>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={pwConfirm}
                          onChange={(e) => setPwConfirm(e.target.value)}
                          className={`w-full rounded-xl border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] transition-colors ${isLight ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white' : 'bg-black/50 border-white/10 text-white placeholder-gray-500 focus:bg-black/70'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-500 hover:text-gray-700' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdatePassword}
                        disabled={pwLoading}
                        className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50 text-xs md:text-sm"
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
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-opacity"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              <div
                className={`w-full max-w-md rounded-2xl border p-4 md:p-6 shadow-2xl transition-all ${isLight ? 'bg-white border-red-100' : 'bg-[#141414] border-red-500/10'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-2 md:gap-3">
                  <div>
                    <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#E54545]">Delete account</p>
                    <p className="mt-1.5 md:mt-2 text-xs md:text-sm text-[#E54545]">
                      Permanently remove your account and data.
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirmDeleteOpen(false)}
                    className={`rounded-lg p-1.5 md:p-2 transition-colors ${isLight ? 'text-gray-500 hover:bg-gray-100' : 'text-[#888888] hover:bg-white/5'}`}
                    aria-label="Close delete confirmation"
                  >
                    <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </button>
                </div>

                <div className="mt-4 md:mt-5 flex flex-col gap-2 md:gap-3">
                  <div className={`rounded-xl p-2 md:p-3 text-[10px] md:text-xs font-medium ${isLight ? 'bg-red-50 text-red-600' : 'bg-red-500/10 text-red-300'}`}>
                    This action cannot be undone.
                  </div>                  <p className="text-xs text-red-400">Your personal data will be removed; order history may be retained for accounting.</p>
                  {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDeleteOpen(false)}
                      className="btn-secondary flex-1 text-xs md:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={deleteLoading}
                      onClick={async () => {
                        setDeleteLoading(true);
                        setDeleteError(null);
                        try {
                          const token = localStorage.getItem('jhyaap_access_token');
                          await deleteCustomerAccount(user.id, token);
                          logout();
                          window.location.href = '/';
                        } catch (error) {
                          setDeleteError(error.message || 'Unable to delete your account.');
                        } finally {
                          setDeleteLoading(false);
                        }
                      }}
                      className="flex-1 rounded-[6px] bg-[#E54545] px-[20px] md:px-[28px] py-[10px] md:py-[12px] font-bold text-white transition-colors duration-200 hover:bg-[#E54545]/90 active:scale-[0.98] text-xs md:text-sm disabled:opacity-50"
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="grid gap-4 lg:grid-cols-2">

              <div className={`rounded-2xl border p-4 md:p-5 transition-colors ${isLight ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-white/10'}`}>
                <p className="mb-2 md:mb-3 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Profile details</p>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <p className={`mb-1.5 md:mb-2 text-[10px] md:text-xs font-semibold ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Name</p>
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
                          className={`rounded-xl border px-3 py-2 transition-colors ${isLight ? 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
                          aria-label="Cancel name edit"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className={`flex items-center justify-between rounded-xl p-3 md:p-4 transition-colors ${isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]/50'}`}>
                        <p className={`font-medium text-sm md:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>{user.name}</p>
                        <button
                          onClick={() => setEditingName(true)}
                          className={`rounded-lg p-2 transition-colors hover:text-[#F5A623] ${isLight ? 'text-gray-400 hover:bg-gray-100' : 'text-night-300 hover:bg-white/5'}`}
                          aria-label="Edit name"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`rounded-xl p-3 md:p-4 transition-colors ${isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]/50'}`}>
                    <p className={`mb-1 text-[10px] md:text-xs font-semibold ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Phone</p>
                    {editingPhone ? (
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className={`text-sm md:text-base font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>+977</span>
                          <input
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            className="input-field flex-1"
                            autoFocus
                            placeholder="98XXXXXXXX"
                          />
                        </div>
                        <button
                          onClick={handleSavePhone}
                          className="rounded-xl bg-[#F5A623] px-3 py-2 text-night-950 font-bold hover:bg-[#F5A623]/90 transition-colors"
                          aria-label="Save phone"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPhone(false);
                            setNewPhone(user.phone);
                          }}
                          className={`rounded-xl border px-3 py-2 transition-colors ${isLight ? 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
                          aria-label="Cancel phone edit"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                          <p className={`flex items-center gap-1.5 md:gap-2 font-medium text-sm md:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#C9A84C]" />
                            +977 {user.phone}
                          </p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#4ADE80]/10 px-1.5 md:px-2 py-0.5 text-[9px] md:text-xs font-semibold text-[#4ADE80]">
                            <Check className="h-3 w-3 md:h-3.5 md:w-3.5" /> Verified
                          </span>
                        </div>
                        <button
                          onClick={() => setEditingPhone(true)}
                          className={`rounded-lg p-2 transition-colors hover:text-[#F5A623] ${isLight ? 'text-gray-400 hover:bg-gray-100' : 'text-night-300 hover:bg-white/5'}`}
                          aria-label="Edit phone"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`rounded-xl p-3 md:p-4 transition-colors ${isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]/50'}`}>
                    <p className={`mb-1 text-[10px] md:text-xs font-semibold ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Email</p>

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
                          className={`rounded-xl border px-3 py-2 transition-colors ${isLight ? 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
                          aria-label="Cancel email edit"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : user.email ? (
                      <div className="flex items-start justify-between gap-3">
                        <p className={`font-medium break-all ${isLight ? 'text-gray-900' : 'text-white'}`}>{user.email}</p>
                        <button
                          onClick={() => setEditingEmail(true)}
                          className={`rounded-lg p-2 transition-colors hover:text-[#F5A623] ${isLight ? 'text-gray-400 hover:bg-gray-100' : 'text-night-300 hover:bg-white/5'}`}
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

                  <div className={`rounded-xl p-3 md:p-4 transition-colors ${isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]/50'}`}>
                    <p className={`mb-1 text-[10px] md:text-xs font-semibold ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Password</p>
                    <div className="flex items-center justify-between gap-3">
                      <p className={`font-medium tracking-widest ${isLight ? 'text-gray-900' : 'text-white'}`}>••••••••</p>
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

              <div className={`rounded-2xl border p-4 md:p-5 transition-colors ${isLight ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-white/10'}`}>
                <p className="mb-2 md:mb-3 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Account tools</p>
                <div className="space-y-2 md:space-y-3">
                  <button onClick={() => setActiveTab('orders')} className={`w-full rounded-xl p-3 md:p-4 text-left transition-colors ${isLight ? 'bg-gray-50 hover:bg-gray-100' : 'bg-[#0A0A0A]/50 hover:bg-white/5'}`}>
                    <p className={`font-semibold text-sm md:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>View orders</p>
                    <p className={`mt-0.5 md:mt-1 text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Track recent purchases and delivery progress.</p>
                  </button>
                  <button onClick={() => setActiveTab('addresses')} className={`w-full rounded-xl p-3 md:p-4 text-left transition-colors ${isLight ? 'bg-gray-50 hover:bg-gray-100' : 'bg-[#0A0A0A]/50 hover:bg-white/5'}`}>
                    <p className={`font-semibold text-sm md:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>Manage addresses</p>
                    <p className={`mt-0.5 md:mt-1 text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Review your saved delivery locations.</p>
                  </button>

                  <button
                    onClick={handleOpenPasswordModal}
                    className={`w-full rounded-xl p-3 md:p-4 text-left transition-colors ${isLight ? 'bg-gray-50 hover:bg-gray-100' : 'bg-[#0A0A0A]/50 hover:bg-white/5'}`}
                  >
                    <p className={`font-semibold text-sm md:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>Change password</p>
                    <p className={`mt-0.5 md:mt-1 text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Update your account password for security.</p>
                  </button>

                  <div className={`rounded-xl border p-3 md:p-4 transition-colors ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Bell className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#C9A84C]" />
                      <p className={`font-semibold text-sm md:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>Notification preferences</p>
                    </div>
                    <p className={`mt-0.5 md:mt-1 text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Choose how you'd like order updates sent.</p>

                    <div className="mt-2 md:mt-3 space-y-1.5 md:space-y-2">
                      {[
                        { key: 'sms', label: 'SMS', value: notifSms, set: setNotifSms },
                        { key: 'whatsapp', label: 'WhatsApp', value: notifWhatsapp, set: setNotifWhatsapp },
                        { key: 'email', label: 'Email', value: notifEmail, set: setNotifEmail },
                      ].map((t) => (
                        <div key={t.key} className={`flex items-center justify-between rounded-lg px-2.5 md:px-3 py-1.5 md:py-2 transition-colors ${isLight ? 'bg-white shadow-sm border border-gray-100' : 'bg-[#0A0A0A]/30'}`}>
                          <span className={`text-xs md:text-sm font-medium ${isLight ? 'text-gray-700' : 'text-white'}`}>{t.label}</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={t.value}
                            aria-label={`Toggle ${t.label} notifications`}
                            onClick={() => t.set(!t.value)}
                            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                              t.value ? 'bg-[#F5A623]' : 'bg-night-700'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                                t.value ? 'translate-x-[22px]' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="w-full rounded-xl bg-[#0A0A0A]/50 p-3 md:p-4 text-left hover:bg-white/5"
                  >
                    <p className="font-semibold text-sm md:text-base" style={{ color: '#E54545' }}>Delete account</p>
                    <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs" style={{ color: '#E54545' }}>Permanently remove your account and data.</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-2 md:space-y-3">
              {orders.length === 0 ? (
                <div className={`rounded-2xl border p-8 md:p-10 text-center transition-colors ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A0A0A] border-white/5'}`}>
                  <Package className="mx-auto mb-2 md:mb-3 h-8 w-8 md:h-10 md:w-10 text-[#888888]" />
                  <p className={`text-sm md:text-base ${isLight ? 'text-gray-500' : 'text-[#DDDDDD]'}`}>No orders yet</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <p className={`text-xs md:text-sm font-semibold ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>
                      {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                    </p>
                    {orders.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to clear your order history? This action cannot be undone.')) {
                            // Clear orders from local store
                            const { clearOrders } = useOrdersStore.getState();
                            clearOrders();
                          }
                        }}
                        className={`text-xs md:text-sm font-semibold transition-colors ${isLight ? 'text-red-600 hover:text-red-700' : 'text-red-400 hover:text-red-300'}`}
                      >
                        Clear history
                      </button>
                    )}
                  </div>
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className={`w-full rounded-2xl border p-3 md:p-4 text-left transition-colors ${isLight ? 'bg-white border-gray-200 hover:border-[#C9A84C]' : 'bg-[#0A0A0A] border-white/5 hover:border-[#C9A84C]/40'}`}
                    >
                      <button
                        onClick={() => {
                          selectOrder(order.id);
                          setPage('order-tracking');
                        }}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between gap-2 md:gap-3">
                          <div>
                            <p className={`font-semibold text-sm md:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>Order No {order.orderNumber || 'Syncing...'}</p>
                            <p className={`mt-0.5 md:mt-1 text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-[#888888]" />
                        </div>
                        <div className="mt-2 md:mt-3 flex flex-wrap items-center justify-between gap-1.5 md:gap-2 text-xs md:text-sm">
                          <span className="rounded-full bg-[#C9A84C]/10 px-2 md:px-3 py-0.5 md:py-1 text-[9px] md:text-xs font-semibold capitalize text-[#C9A84C]">
                            {order.status.replace('_', ' ')}
                          </span>
                          <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>NPR {order.total.toLocaleString()}</span>
                        </div>
                      </button>
                      {(order.status === 'placed' || order.status === 'confirmed') && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this order?')) {
                              // Cancel order logic
                              const { updateOrderStatus } = useOrdersStore.getState();
                              updateOrderStatus(order.id, 'cancelled');
                            }
                          }}
                          className={`mt-2 w-full rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${isLight ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>)}

          {activeTab === 'orders' && orders.some((order) => order.status === 'delivered') && (
            <div className="mt-3 space-y-2 md:space-y-3">
              {orders.filter((order) => order.status === 'delivered').map((order) => (
                <DeliveryRatingForm key={'rating-' + order.id} order={order} user={user} isLight={isLight} />
              ))}
            </div>
          )}
          {activeTab === 'loyalty' && (
            <div className="space-y-3 md:space-y-4">
              <div className={`rounded-2xl border p-4 md:p-6 transition-colors ${isLight ? 'bg-gold-primary/5 border-gold-primary/20' : 'bg-gradient-to-r from-[#C9A84C]/10 to-transparent border-[#C9A84C]/20'}`}>
                <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Jhyaap Station Rewards</p>
                <p className={`mt-1.5 md:mt-2 text-2xl md:text-4xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{loyaltyPoints} <span className={`text-sm md:text-lg font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>points</span></p>
                <p className={`mt-0.5 md:mt-1 text-xs md:text-sm ${isLight ? 'text-gray-600' : 'text-[#DDDDDD]'}`}>Worth Rs {loyaltyValue} at checkout</p>
                <p className={`mt-2 md:mt-4 text-[9px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>
                  Earn {POINTS_PER_100_RS} pt per Rs 100 spent Â· Redeem {POINTS_TO_RUPEE} pts = Rs 1
                </p>
              </div>

              <div className={`rounded-2xl border p-4 md:p-5 transition-colors ${isLight ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-white/10'}`}>
                <p className={`mb-3 md:mb-4 text-xs md:text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Points history</p>
                {loyaltyHistory.length === 0 ? (
                  <p className={`text-xs md:text-sm ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Complete a delivery to start earning points.</p>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {loyaltyHistory.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between rounded-xl bg-[#0A0A0A]/50 px-3 md:px-4 py-2 md:py-3">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-white">{tx.description}</p>
                          <p className="text-[9px] md:text-xs text-[#888888]">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`text-xs md:text-sm font-bold ${tx.type === 'earn' ? 'text-green-400' : 'text-neon-rose'}`}>
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
            <div className="grid gap-2 md:gap-3 md:grid-cols-2">
              {addresses.length === 0 ? (
                <div className={`rounded-2xl border p-8 md:p-10 text-center md:col-span-2 transition-colors ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A0A0A] border-white/5'}`}>
                  <MapPin className="mx-auto mb-2 md:mb-3 h-8 w-8 md:h-10 md:w-10 text-[#888888]" />
                  <p className={`text-sm md:text-base ${isLight ? 'text-gray-500' : 'text-[#DDDDDD]'}`}>No addresses added</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className={`rounded-2xl border p-4 md:p-5 transition-colors ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A0A0A] border-white/5'}`}>
                    <div className="flex items-start justify-between gap-2 md:gap-3">
                      <div>
                        <p className={`font-semibold text-sm md:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>{addr.label}</p>
                        <p className={`mt-0.5 md:mt-1 text-xs md:text-sm ${isLight ? 'text-gray-600' : 'text-[#DDDDDD]'}`}>{addr.street}, {addr.area}</p>
                        {addr.landmark && <p className={`text-[9px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>{addr.landmark}</p>}
                      </div>
                      <button onClick={() => deleteAddress(addr.id)} className="text-[9px] md:text-xs font-semibold text-red-400 hover:text-red-500">
                        Delete
                      </button>
                    </div>
                    <div className={`mt-3 md:mt-4 flex items-center justify-between text-[9px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>
                      <span>Delivery Fee: NPR {addr.deliveryFee}</span>
                      {addr.isDefault && <span className="rounded-full bg-[#C9A84C]/10 px-1.5 md:px-2 py-0.5 md:py-1 text-[#C9A84C]">Default</span>}
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






