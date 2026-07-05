import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { ADMIN_BASE_PATH } from '@/lib/adminRoutes';
import { Link } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAdminStore((s) => s.login);
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) navigate(ADMIN_BASE_PATH, { replace: true });
  }, [isAdmin, navigate]);

  if (isAdmin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username.trim(), password)) {
      navigate(ADMIN_BASE_PATH);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-night-950 via-night-900 to-night-950 px-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-night-400 transition-colors hover:text-neon-amber font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </Link>
        <div className="mb-10 text-center">
          <div className="relative inline-block">
            <BrandLogo size="xl" className="mx-auto ring-2 ring-neon-amber/40 shadow-2xl shadow-neon-amber/20" />
            <div className="absolute -inset-4 rounded-full bg-neon-amber/10 blur-xl -z-10"></div>
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold text-white tracking-tight">Admin Panel</h1>
          <p className="mt-2 text-sm text-night-300">Night Owl Liquors — staff login</p>
        </div>

        <form onSubmit={handleSubmit} className="panel space-y-6 p-8 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10 shadow-2xl">
          <div>
            <label htmlFor="admin-username" className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">
              Username
            </label>
            <input
              id="admin-username"
              className="input-field w-full bg-night-800/50 border-white/10 focus:border-neon-amber/50 focus:ring-neon-amber/20"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-night-400">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              className="input-field w-full bg-night-800/50 border-white/10 focus:border-neon-amber/50 focus:ring-neon-amber/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-neon-rose/10 border border-neon-rose/30 px-4 py-3 text-center text-xs font-semibold text-neon-rose">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary flex w-full items-center justify-center gap-2 text-sm font-bold py-3 shadow-lg shadow-neon-amber/20 hover:shadow-neon-amber/30 transition-all">
            <Lock className="h-4 w-4" />
            Sign in as Admin
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-night-500">
            Secure admin access • Jhyaap Station Management System
          </p>
        </div>
      </div>
    </div>
  );
}
