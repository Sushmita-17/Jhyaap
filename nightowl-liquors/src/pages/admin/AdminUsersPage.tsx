import { useState, useMemo } from 'react';
import { Search, Mail, TrendingUp, ShoppingCart } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';

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
      
      <div className="panel flex flex-wrap items-center justify-between gap-6 border-neon-amber/30 bg-gradient-to-r from-neon-amber/15 via-neon-amber/5 to-transparent p-6 shadow-xl shadow-neon-amber/10 animate-gradient-x bg-[length:200%_200%]">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Customers & Users</h1>
          <p className="mt-2 text-sm text-night-300">Manage your customer base</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-night-400">Total Customers</p>
            <p className="text-lg font-bold text-white">{customers.length}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <p className="text-xs text-night-400">Total Revenue</p>
            <p className="text-lg font-bold text-neon-amber">Rs {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="panel p-5 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:scale-105 animate-slide-up">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-amber/20 text-neon-amber">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-night-500">Active Customers</p>
              <p className="mt-1 text-2xl font-bold text-white">{activeCustomers}</p>
            </div>
          </div>
        </div>
        <div className="panel p-5 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:scale-105 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-night-500">Avg Orders/Customer</p>
              <p className="mt-1 text-2xl font-bold text-white">{avgOrders}</p>
            </div>
          </div>
        </div>
        <div className="panel p-5 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:scale-105 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-night-500">Avg Spend/Customer</p>
              <p className="mt-1 text-2xl font-bold text-white">Rs {Math.round(totalRevenue / customers.length).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative min-w-[250px] flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-night-500" />
          <input
            className="input-field w-full pl-12 bg-night-800/50 border-white/10 focus:border-neon-amber/50 focus:ring-neon-amber/20"
            placeholder="Search name, email, phone, location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="input-field bg-night-800/50 border-white/10 focus:border-neon-amber/50 focus:ring-neon-amber/20"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="panel overflow-hidden bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-night-950/60 text-xs uppercase tracking-wider text-night-500">
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
            <tbody className="divide-y divide-white/5">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-amber to-amber-600 text-sm font-bold uppercase text-white shadow-lg shadow-neon-amber/20">
                        {customer.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{customer.name}</p>
                        <p className="text-xs text-night-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-night-300">{customer.phone}</td>
                  <td className="px-6 py-4 text-night-300">{customer.location}</td>
                  <td className="px-6 py-4 text-night-400">
                    {new Date(customer.joinedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-white font-semibold">{customer.totalOrders}</td>
                  <td className="px-6 py-4 text-neon-amber font-bold">Rs {customer.totalSpent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-night-400">
                    {new Date(customer.lastOrder).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                      customer.status === 'active' 
                        ? 'bg-green-500/15 text-green-400 border-green-500/20' 
                        : 'bg-red-500/15 text-red-400 border-red-500/20'
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
          <p className="px-6 py-16 text-center text-night-500">No customers match your filters</p>
        )}
      </div>
    </div>
  );
}
