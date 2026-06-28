import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Shield, MapPin, Phone, Mail } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';

interface Professional {
  id: string;
  name: string;
  role: 'manager' | 'delivery' | 'staff' | 'support';
  email: string;
  phone: string;
  location: string;
  joinedDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  avatar?: string;
}

const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Rajesh Sharma',
    role: 'manager',
    email: 'rajesh@nightowl.com',
    phone: '+977 98XXXXXXXX',
    location: 'Jhyaap Station',
    joinedDate: '2023-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Sita Thapa',
    role: 'delivery',
    email: 'sita@nightowl.com',
    phone: '+977 97XXXXXXXX',
    location: 'Jhyaap Station',
    joinedDate: '2023-03-20',
    status: 'active',
  },
  {
    id: '3',
    name: 'Bikash Gurung',
    role: 'staff',
    email: 'bikash@nightowl.com',
    phone: '+977 98XXXXXXXX',
    location: 'Jhyaap Station',
    joinedDate: '2023-06-10',
    status: 'active',
  },
  {
    id: '4',
    name: 'Anita Magar',
    role: 'support',
    email: 'anita@nightowl.com',
    phone: '+977 98XXXXXXXX',
    location: 'Jhyaap Station',
    joinedDate: '2023-08-05',
    status: 'on_leave',
  },
];

const roleColors = {
  manager: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivery: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  staff: 'bg-green-500/20 text-green-400 border-green-500/30',
  support: 'bg-neon-amber/20 text-neon-amber border-neon-amber/30',
};

const statusColors = {
  active: 'bg-green-500/15 text-green-400 border-green-500/20',
  inactive: 'bg-red-500/15 text-red-400 border-red-500/20',
  on_leave: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
};

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = professionals.filter((p) => {
    const matchesQuery = 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.email.toLowerCase().includes(query.toLowerCase()) ||
      p.phone.includes(query);
    const matchesRole = !roleFilter || p.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Remove "${name}" from team? This cannot be undone.`)) {
      setProfessionals(professionals.filter((p) => p.id !== id));
    }
  };

  const activeCount = professionals.filter((p) => p.status === 'active').length;
  const onLeaveCount = professionals.filter((p) => p.status === 'on_leave').length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
      <AdminBackButton />
      
      <div className="panel flex flex-wrap items-center justify-between gap-6 border-neon-amber/30 bg-gradient-to-r from-neon-amber/15 via-neon-amber/5 to-transparent p-6 shadow-xl shadow-neon-amber/10 animate-gradient-x bg-[length:200%_200%]">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Team & Professionals</h1>
          <p className="mt-2 text-sm text-night-300">Manage your Night Owl staff members</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-night-400">Active Staff</p>
            <p className="text-lg font-bold text-white">{activeCount}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <p className="text-xs text-night-400">On Leave</p>
            <p className="text-lg font-bold text-white">{onLeaveCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(roleColors).map(([role, color]) => {
          const count = professionals.filter((p) => p.role === role).length;
          const roleIcons = {
            manager: Shield,
            delivery: MapPin,
            staff: Phone,
            support: Mail,
          };
          const Icon = roleIcons[role as keyof typeof roleIcons];
          return (
            <div key={role} className="panel p-5 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:scale-105 animate-slide-up">
              <div className="flex items-center gap-4">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-night-500">{role}</p>
                  <p className="mt-1 text-2xl font-bold text-white">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative min-w-[250px] flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-night-500" />
          <input
            className="input-field w-full pl-12 bg-night-800/50 border-white/10 focus:border-neon-amber/50 focus:ring-neon-amber/20"
            placeholder="Search name, email, phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="input-field bg-night-800/50 border-white/10 focus:border-neon-amber/50 focus:ring-neon-amber/20"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="manager">Manager</option>
          <option value="delivery">Delivery</option>
          <option value="staff">Staff</option>
          <option value="support">Support</option>
        </select>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-neon-amber/30 bg-neon-amber/15 px-6 py-3 text-sm font-bold text-neon-amber transition-all hover:bg-neon-amber/25 hover:shadow-lg hover:shadow-neon-amber/20"
        >
          <Plus className="h-4 w-4" />
          Add Professional
        </button>
      </div>

      <div className="panel overflow-hidden bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-night-950/60 text-xs uppercase tracking-wider text-night-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Professional</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((professional) => (
                <tr key={professional.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-neon-amber to-amber-600 text-sm font-bold uppercase text-white shadow-lg shadow-neon-amber/20">
                        {professional.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{professional.name}</p>
                        <p className="text-xs text-night-500">{professional.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${roleColors[professional.role]}`}>
                      {professional.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-night-300">{professional.phone}</td>
                  <td className="px-6 py-4 text-night-300">{professional.location}</td>
                  <td className="px-6 py-4 text-night-400">
                    {new Date(professional.joinedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${statusColors[professional.status]}`}>
                      {professional.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-xl p-2.5 text-night-400 hover:bg-white/5 hover:text-neon-amber transition-all" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(professional.id, professional.name)}
                        className="rounded-xl p-2.5 text-night-400 hover:bg-neon-rose/10 hover:text-neon-rose transition-all"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="px-6 py-16 text-center text-night-500">No professionals match your filters</p>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-950/80 backdrop-blur-sm">
          <div className="panel w-full max-w-lg p-8 bg-gradient-to-br from-night-900/95 to-night-800/80 border border-white/10 shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-white mb-6">Add New Professional</h2>
            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Full Name</label>
                <input className="input-field w-full bg-night-800/50 border-white/10" placeholder="Enter name" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Role</label>
                <select className="input-field w-full bg-night-800/50 border-white/10">
                  <option value="">Select role</option>
                  <option value="manager">Manager</option>
                  <option value="delivery">Delivery</option>
                  <option value="staff">Staff</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Email</label>
                <input className="input-field w-full bg-night-800/50 border-white/10" type="email" placeholder="email@example.com" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Phone</label>
                <input className="input-field w-full bg-night-800/50 border-white/10" placeholder="+977 9XXXXXXXXX" />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-night-800/50 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-night-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-neon-amber px-6 py-3 text-sm font-bold text-night-950 transition-all hover:bg-amber-400"
                >
                  Add Professional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
