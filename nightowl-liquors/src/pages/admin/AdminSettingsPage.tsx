import { useState } from 'react';
import { Save, Bell, Lock, Store, Clock, Truck, CreditCard } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
      <AdminBackButton />
      
      <div className="panel flex flex-wrap items-center justify-between gap-6 border-neon-amber/30 bg-gradient-to-r from-neon-amber/15 via-neon-amber/5 to-transparent p-6 shadow-xl shadow-neon-amber/10 animate-gradient-x bg-[length:200%_200%]">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="mt-2 text-sm text-night-300">Configure your Night Owl store</p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl border border-neon-amber/30 bg-neon-amber/15 px-6 py-3 text-sm font-bold text-neon-amber transition-all hover:bg-neon-amber/25 hover:shadow-lg hover:shadow-neon-amber/20 animate-glow"
        >
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Store Settings */}
        <div className="panel p-6 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-amber/20 text-neon-amber">
              <Store className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Store Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Store Name</label>
              <input className="input-field w-full bg-night-800/50 border-white/10" defaultValue="Night Owl Liquors" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Location</label>
              <input className="input-field w-full bg-night-800/50 border-white/10" defaultValue="Jhyaap Station, Kathmandu" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Contact Phone</label>
              <input className="input-field w-full bg-night-800/50 border-white/10" defaultValue="+977 98XXXXXXXX" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Email</label>
              <input className="input-field w-full bg-night-800/50 border-white/10" defaultValue="info@nightowl.com" />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="panel p-6 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
              <Truck className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Delivery Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Delivery Fee (Rs)</label>
              <input className="input-field w-full bg-night-800/50 border-white/10" defaultValue="100" type="number" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Free Delivery Minimum (Rs)</label>
              <input className="input-field w-full bg-night-800/50 border-white/10" defaultValue="2000" type="number" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Estimated Delivery Time</label>
              <input className="input-field w-full bg-night-800/50 border-white/10" defaultValue="30-45 minutes" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Delivery Radius (km)</label>
              <input className="input-field w-full bg-night-800/50 border-white/10" defaultValue="5" type="number" />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="panel p-6 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
              <Clock className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Operating Hours</h2>
          </div>
          <div className="space-y-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="flex items-center gap-4">
                <span className="w-28 text-sm font-medium text-night-300">{day}</span>
                <input className="input-field flex-1 bg-night-800/50 border-white/10" defaultValue="10:00 AM" />
                <span className="text-night-500">to</span>
                <input className="input-field flex-1 bg-night-800/50 border-white/10" defaultValue="10:00 PM" />
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="panel p-6 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <CreditCard className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Payment Methods</h2>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Cash on Delivery', enabled: true },
              { name: 'eSewa', enabled: true },
              { name: 'Khalti', enabled: true },
              { name: 'Fonepay', enabled: false },
              { name: 'Credit/Debit Card', enabled: false },
            ].map((method) => (
              <div key={method.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-night-800/30 p-4">
                <span className="text-sm font-medium text-white">{method.name}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
                  <div className="w-11 h-6 bg-night-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-amber" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="panel p-6 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-rose/20 text-neon-rose">
              <Bell className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          <div className="space-y-3">
            {[
              { name: 'New order alerts', enabled: true },
              { name: 'Low stock warnings', enabled: true },
              { name: 'Customer messages', enabled: true },
              { name: 'Daily sales report', enabled: false },
              { name: 'Weekly analytics', enabled: false },
            ].map((notif) => (
              <div key={notif.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-night-800/30 p-4">
                <span className="text-sm font-medium text-white">{notif.name}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
                  <div className="w-11 h-6 bg-night-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-amber" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="panel p-6 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
              <Lock className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Change Admin Password</label>
              <input className="input-field w-full bg-night-800/50 border-white/10" type="password" placeholder="New password" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">Confirm Password</label>
              <input className="input-field w-full bg-night-800/50 border-white/10" type="password" placeholder="Confirm new password" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-night-800/30 p-4">
              <div>
                <span className="text-sm font-medium text-white">Two-Factor Authentication</span>
                <p className="text-xs text-night-500 mt-1">Add extra security to your admin account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-night-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-amber" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
