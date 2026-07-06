import { useState, useMemo } from 'react';
import { Search, Mail, TrendingUp, ShoppingCart } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: 'active' | 'inactive';
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Aarav Koirala',
    email: 'aarav@gmail.com',
    phone: '+977 98XXXXXXXX',
    location: 'Kathmandu',
    joinedDate: '2023-02-10',
    totalOrders: 15,
    totalSpent: 45000,
    lastOrder: '2024-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Priya Shrestha',
    email: 'priya@gmail.com',
    phone: '+977 97XXXXXXXX',
    location: 'Lalitpur',
    joinedDate: '2023-05-20',
    totalOrders: 8,
    totalSpent: 28000,
    lastOrder: '2024-01-10',
    status: 'active',
  },
  {
    id: '3',
    name: 'Bibek Thapa',
    email: 'bibek@gmail.com',
    phone: '+977 98XXXXXXXX',
    location: 'Bhaktapur',
    joinedDate: '2023-08-15',
    totalOrders: 3,
    totalSpent: 8500,
    lastOrder: '2023-12-20',
    status: 'inactive',
  },
  {
    id: '4',
    name: 'Srijana Maharjan',
    email: 'srijana@gmail.com',
    phone: '+977 98XXXXXXXX',
    location: 'Kathmandu',
    joinedDate: '2023-11-05',
    totalOrders: 22,
    totalSpent: 67000,
    lastOrder: '2024-01-18',
    status: 'active',
  },
];

export default function AdminUsersPage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const [customers] = useState<Customer[]>(mockCustomers);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesQuery = 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query) ||
        c.location.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [customers, query, statusFilter]);

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const activeCustomers = customers.filter((c) => c.status === 'active').length;
  const avgOrders = customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
      <AdminBackButton />
      
      <div className={`panel flex flex-wrap items-center justify-between gap-6 border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent p-6 shadow-2xl shadow-[#C9A84C]/20 animate-gradient-x bg-[length:200%_200%] backdrop-blur-xl relative overflow-hidden ${
        isLight ? 'border-gray-200' : ''
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 to-transparent animate-shimmer bg-[length:200%_100%]" />
        <div className="relative">
          <h1 className={`font-display text-3xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${
            isLight 
              ? 'text-gray-900 from-gray-900 to-gray-700' 
              : 'text-white from-white to-white/80'
          }`}>Customers & Users</h1>
          <p className={`mt-2 text-sm ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>Manage your customer base</p>
        </div>
        <div className="relative flex items-center gap-4">
          <div className="text-right">
            <p className={`text-xs uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>Total Customers</p>
            <p className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{customers.length}</p>
          </div>
          <div className={`h-8 w-px ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
          <div className="text-right">
            <p className={`text-xs uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>Total Revenue</p>
            <p className="text-lg font-bold text-[#C9A84C]">Rs {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className={`panel p-5 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 hover:scale-[1.02] animate-slide-up relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200 hover:shadow-gray-100' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-4">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A84C]/20 text-[#C9A84C] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 animate-float">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Active Customers</p>
              <p className={`mt-1 text-2xl font-bold group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>{activeCustomers}</p>
            </div>
          </div>
        </div>
        <div className={`panel p-5 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 hover:scale-[1.02] animate-slide-up relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200 hover:shadow-gray-100' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`} style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-4">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 animate-float">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Avg Orders/Customer</p>
              <p className={`mt-1 text-2xl font-bold group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>{avgOrders}</p>
            </div>
          </div>
        </div>
        <div className={`panel p-5 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 hover:scale-[1.02] animate-slide-up relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200 hover:shadow-gray-100' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`} style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-4">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 animate-float">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Avg Spend/Customer</p>
              <p className={`mt-1 text-2xl font-bold group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>Rs {Math.round(totalRevenue / customers.length).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative min-w-[250px] flex-1">
          <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-[#888888]'}`} />
          <input
            className={`input-field w-full pl-12 backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
              isLight 
                ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                : 'bg-[#1A1A1A]/80 border-white/10 text-white'
            }`}
            placeholder="Search name, email, phone, location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className={`input-field backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
            isLight 
              ? 'bg-gray-50 border-gray-300 text-gray-900' 
              : 'bg-[#1A1A1A]/80 border-white/10 text-white'
          }`}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className={`panel overflow-hidden backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
        isLight 
          ? 'bg-white border-gray-200 hover:shadow-gray-100' 
          : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <div className="relative overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs uppercase tracking-wider ${
              isLight 
                ? 'bg-gray-50 text-gray-500' 
                : 'bg-[#0A0A0A]/60 text-[#888888]'
            }`}>
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold">Orders</th>
                <th className="px-6 py-4 font-semibold">Total Spent</th>
                <th className="px-6 py-4 font-semibold">Last Order</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isLight ? 'divide-gray-200' : 'divide-white/5'
            }`}>
              {filtered.map((customer, index) => (
                <tr key={customer.id} className={`hover:shadow-lg hover:shadow-[#C9A84C]/10 transition-all duration-300 group ${
                  isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.05]'
                }`} style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#A68B3D] text-sm font-bold uppercase text-white shadow-lg shadow-[#C9A84C]/20 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl group-hover:shadow-[#C9A84C]/40 transition-all duration-300">
                        {customer.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className={`truncate font-semibold group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>{customer.name}</p>
                        <p className={`text-xs group-hover:text-[#666666] transition-colors ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 group-hover:text-white transition-colors ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-[#888888]'}`}>{customer.phone}</td>
                  <td className={`px-6 py-4 group-hover:text-white transition-colors ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-[#888888]'}`}>{customer.location}</td>
                  <td className={`px-6 py-4 group-hover:text-white transition-colors ${isLight ? 'text-gray-500 hover:text-gray-900' : 'text-[#666666]'}`}>
                    {new Date(customer.joinedDate).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-4 font-semibold group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>{customer.totalOrders}</td>
                  <td className={`px-6 py-4 font-bold group-hover:text-white transition-colors ${isLight ? 'text-gray-900 hover:text-[#C9A84C]' : 'text-[#C9A84C]'}`}>Rs {customer.totalSpent.toLocaleString()}</td>
                  <td className={`px-6 py-4 group-hover:text-white transition-colors ${isLight ? 'text-gray-500 hover:text-gray-900' : 'text-[#666666]'}`}>
                    {new Date(customer.lastOrder).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                      customer.status === 'active' 
                        ? 'bg-green-500/15 text-green-400 border-green-500/20 shadow-lg shadow-green-500/10' 
                        : 'bg-red-500/15 text-red-400 border-red-500/20 shadow-lg shadow-red-500/10'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="px-6 py-16 text-center text-[#888888]">No customers match your filters</p>
        )}
      </div>
    </div>
  );
}
