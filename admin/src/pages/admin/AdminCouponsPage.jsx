import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Calendar, Percent, DollarSign, Truck, Copy, Check, X } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';
import { getBackendCoupons } from '@/lib/backendAPI';


export default function AdminCouponsPage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const [coupons, setCoupons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  useEffect(() => {
    let active = true;
    getBackendCoupons().then((data) => {
      if (!active || !Array.isArray(data)) return;
      setCoupons(data.map((coupon) => ({
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.min_order || 0,
        maxUses: coupon.max_uses || 0,
        usesCount: coupon.uses_count || 0,
        expiresAt: coupon.expires_at || '',
        status: coupon.status || 'active',
        createdAt: coupon.created_at || '',
      })));
    }).catch((error) => { console.error('Failed to load live admin data:', error); });
    return () => { active = false; };
  }, []);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    minOrder: 0,
    maxUses: 100,
    expiresAt: '',
  });

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = searchQuery === '' || coupon.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCoupons = coupons.filter((c) => c.status === 'active').length;
  const expiredCoupons = coupons.filter((c) => c.status === 'expired').length;

  const handleDelete = (id, code) => {
    if (window.confirm(`Delete coupon "${code}"? This cannot be undone.`)) {
      setCoupons(coupons.filter((c) => c.id !== id));
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSave = () => {
    if (editingCoupon) {
      setCoupons(coupons.map((c) => (c.id === editingCoupon.id ? { ...c, ...formData } : c)));
    } else {
      const newCoupon = {
        id: Date.now().toString(),
        ...formData,
        usesCount: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCoupons([newCoupon, ...coupons]);
    }
    setShowModal(false);
    setEditingCoupon(null);
    setFormData({ code: '', type: 'percentage', value: 0, minOrder: 0, maxUses: 100, expiresAt: '' });
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      maxUses: coupon.maxUses,
      expiresAt: coupon.expiresAt,
    });
    setShowModal(true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'percentage': return Percent;
      case 'flat': return DollarSign;
      case 'free_delivery': return Truck;
      default: return Percent;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'percentage': return 'Percentage';
      case 'flat': return 'Flat Amount';
      case 'free_delivery': return 'Free Delivery';
      default: return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'disabled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
      <AdminBackButton />

      <div className={`panel flex flex-wrap items-center justify-between gap-6 border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent p-6 shadow-xl shadow-[#C9A84C]/10 ${
        isLight ? 'border-gray-200' : ''
      }`}>
        <div>
          <h1 className={`font-display text-3xl font-bold tracking-tight ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>Coupons & Discounts</h1>
          <p className={`mt-2 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Manage promotional codes and discounts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Active</p>
            <p className="text-lg font-bold text-green-400">{activeCoupons}</p>
          </div>
          <div className={`h-8 w-px ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
          <div className="text-right">
            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Expired</p>
            <p className="text-lg font-bold text-red-400">{expiredCoupons}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`panel p-5 border hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-105 animate-slide-up ${
          isLight 
            ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-gray-200' 
            : 'bg-gradient-to-br from-[#0D0D0D]/80 to-[#0A0A0A]/40 border-white/10 hover:shadow-black/20'
        }`}>
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A84C]/20 text-[#C9A84C]">
              <Percent className="h-5 w-5" />
            </span>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Total Coupons</p>
              <p className={`mt-1 text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{coupons.length}</p>
            </div>
          </div>
        </div>
        <div className={`panel p-5 border hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-105 animate-slide-up ${
          isLight 
            ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-gray-200' 
            : 'bg-gradient-to-br from-[#0D0D0D]/80 to-[#0A0A0A]/40 border-white/10 hover:shadow-black/20'
        }`} style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
              <Check className="h-5 w-5" />
            </span>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Total Uses</p>
              <p className={`mt-1 text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{coupons.reduce((sum, c) => sum + c.usesCount, 0)}</p>
            </div>
          </div>
        </div>
        <div className={`panel p-5 border hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-105 animate-slide-up ${
          isLight 
            ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-gray-200' 
            : 'bg-gradient-to-br from-[#0D0D0D]/80 to-[#0A0A0A]/40 border-white/10 hover:shadow-black/20'
        }`} style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <Calendar className="h-5 w-5" />
            </span>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Expiring Soon</p>
              <p className={`mt-1 text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>2</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingCoupon(null);
            setFormData({ code: '', type: 'percentage', value: 0, minOrder: 0, maxUses: 100, expiresAt: '' });
            setShowModal(true);
          }}
          className={`panel p-5 border hover:border-[#C9A84C]/50 transition-all duration-300 hover:shadow-xl hover:scale-105 animate-slide-up flex items-center justify-center gap-3 cursor-pointer ${
            isLight 
              ? 'bg-white border-gray-200 hover:border-[#C9A84C]/50 hover:shadow-[#C9A84C]/20' 
              : 'bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 border-[#C9A84C]/30 hover:shadow-[#C9A84C]/20'
          }`}
          style={{ animationDelay: '0.3s' }}
        >
          <Plus className="h-5 w-5 text-[#C9A84C]" />
          <span className="font-bold text-[#C9A84C]">Create Coupon</span>
        </button>
      </div>

      <div className={`panel p-5 ${
        isLight ? 'bg-white border-gray-200' : 'bg-[#0A0A0A]/50 border-white/10'
      }`}>
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isLight ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`input-field w-full pl-12 focus:border-[#C9A84C]/50 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#0A0A0A]/50 border-white/10 text-white'
              }`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`input-field focus:border-[#C9A84C]/50 ${
              isLight 
                ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                : 'bg-[#0A0A0A]/50 border-white/10 text-white'
            }`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs uppercase tracking-wider ${
              isLight 
                ? 'bg-gray-50 text-gray-600' 
                : 'bg-[#0A0A0A]/60 text-gray-500'
            }`}>
              <tr>
                <th className="px-6 py-4 font-semibold">Coupon Code</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Value</th>
                <th className="px-6 py-4 font-semibold">Min Order</th>
                <th className="px-6 py-4 font-semibold">Usage</th>
                <th className="px-6 py-4 font-semibold">Expires</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isLight ? 'divide-gray-200' : 'divide-white/5'
            }`}>
              {filteredCoupons.map((coupon) => {
                const TypeIcon = getTypeIcon(coupon.type);
                const usagePercent = (coupon.usesCount / coupon.maxUses) * 100;
                return (
                  <tr key={coupon.id} className={`transition-colors group ${
                    isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.03]'
                  }`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border font-mono font-bold text-[#C9A84C] ${
                          isLight 
                            ? 'bg-gray-100 border-gray-200' 
                            : 'bg-[#0A0A0A] border-white/10'
                        }`}>
                          {coupon.code.slice(0, 2)}
                        </div>
                        <div>
                          <p className={`font-semibold group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>{coupon.code}</p>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="text-xs text-gray-500 hover:text-[#C9A84C] transition-colors flex items-center gap-1"
                          >
                            {copiedCode === coupon.code ? (
                              <>
                                <Check className="h-3 w-3" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-gray-400" />
                        <span className={`text-gray-300 ${isLight ? 'text-gray-600' : ''}`}>{getTypeLabel(coupon.type)}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {coupon.type === 'percentage' ? `${coupon.value}%` : coupon.type === 'flat' ? `Rs ${coupon.value}` : 'Free'}
                    </td>
                    <td className={`px-6 py-4 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Rs {coupon.minOrder.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className={`text-gray-400 ${isLight ? 'text-gray-500' : ''}`}>{coupon.usesCount}/{coupon.maxUses}</span>
                          <span className={`text-gray-500 ${isLight ? 'text-gray-400' : ''}`}>{Math.round(usagePercent)}%</span>
                        </div>
                        <div className={`h-2 overflow-hidden rounded-full ${isLight ? 'bg-gray-200' : 'bg-[#0A0A0A]'}`}>
                          <div
                            className={`h-full rounded-full transition-all ${
                              usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-[#C9A84C]' : 'bg-green-500'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{new Date(coupon.expiresAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${getStatusColor(coupon.status)}`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className={`rounded-xl p-2.5 transition-all hover:scale-110 ${
                            isLight 
                              ? 'text-gray-400 hover:bg-gray-100 hover:text-[#C9A84C]' 
                              : 'text-gray-400 hover:bg-white/5 hover:text-[#C9A84C]'
                          }`}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          className="rounded-xl p-2.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all hover:scale-110"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className={`absolute inset-0 backdrop-blur-sm ${isLight ? 'bg-gray-900/50' : 'bg-[#0A0A0A]/80'}`} onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-lg rounded-2xl border backdrop-blur-xl p-6 shadow-2xl animate-fade-in ${
            isLight 
              ? 'bg-white border-gray-200' 
              : 'bg-[#0D0D0D]/95 border-white/10'
          }`}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`rounded-lg p-2 transition-colors ${
                  isLight 
                    ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-900' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., WELCOME15"
                  className={`input-field w-full font-mono focus:border-[#C9A84C]/50 ${
                    isLight 
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                      : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  Discount Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`input-field w-full focus:border-[#C9A84C]/50 ${
                    isLight 
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                      : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                  }`}
                >
                  <option value="percentage">Percentage Off</option>
                  <option value="flat">Flat Amount</option>
                  <option value="free_delivery">Free Delivery</option>
                </select>
              </div>

              {formData.type !== 'free_delivery' && (
                <div>
                  <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                    {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount (Rs)'}
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder={formData.type === 'percentage' ? '15' : '500'}
                    className={`input-field w-full focus:border-[#C9A84C]/50 ${
                      isLight 
                        ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                        : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                    }`}
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                    Minimum Order (Rs)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                    placeholder="1000"
                    className={`input-field w-full focus:border-[#C9A84C]/50 ${
                      isLight 
                        ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                        : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                    Max Uses
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                    placeholder="100"
                    className={`input-field w-full focus:border-[#C9A84C]/50 ${
                      isLight 
                        ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                        : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className={`input-field w-full focus:border-[#C9A84C]/50 ${
                    isLight 
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                      : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 btn-primary"
              >
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all hover:bg-white/5 ${
                  isLight 
                    ? 'border-gray-300 text-gray-900 hover:bg-gray-100' 
                    : 'border-white/10 text-white'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



