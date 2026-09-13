import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Bike } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeStore } from '@/store/themeStore';
import { ADMIN_BASE_PATH } from '@/lib/adminRoutes';

export default function AdminLogin() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ADMIN_BASE_PATH);
    }
  }, [isAuthenticated, navigate]);

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isLight ? 'bg-gray-50' : 'bg-night-950'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A84C]"></div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData);
      if (result.success) {
        // Redirect to admin panel after successful login
        navigate(ADMIN_BASE_PATH);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isLight ? 'bg-gray-50' : 'bg-night-950'
    }`}>
      <div className={`w-full max-w-md ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-gray-800 border-gray-700'
      } rounded-2xl border p-8 shadow-2xl`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#A68B3D] mb-4">
            <Bike className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Jhyaap Station
          </h1>
          <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Admin Login
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isLight ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isLight ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:border-[#C9A84C]/50 ${
                  isLight 
                    ? 'bg-white border-gray-300 text-gray-900 focus:bg-gray-50' 
                    : 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600'
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isLight ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isLight ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••"
                className={`w-full pl-10 pr-12 py-3 rounded-lg border outline-none focus:border-[#C9A84C]/50 ${
                  isLight 
                    ? 'bg-white border-gray-300 text-gray-900 focus:bg-gray-50' 
                    : 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${
                  isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-700'
                }`}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-colors border-none cursor-pointer ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#C9A84C] text-[#0D0D0D] hover:bg-[#A68B3D]'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>


      </div>
    </div>
  );
}
