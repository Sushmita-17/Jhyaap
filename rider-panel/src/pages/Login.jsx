import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { authActions } from '../store/authStore'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authActions.login(phone, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your phone number and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0F0B08]">
      <div className="w-full max-w-sm rider-card p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Jhyaap Rider</h1>
          <p className="text-sm text-gray-400">Late-night delivery, made easy</p>
        </header>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-md p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="+977 98XXXXXXXX"
              value={phone}
              onChange={(e) => {
                // Keep only: +977 + max 10 digits
                const raw = e.target.value
                const trimmed = raw.replace(/\s+/g, '')
                const hasPrefix = trimmed.startsWith('+977')
                if (!hasPrefix) {
                  setPhone('+977')
                  return
                }
                const digits = trimmed.slice(4).replace(/\D/g, '').slice(0, 10)
                setPhone(`+977${digits}`)
              }}
              pattern="^\+977\d{10}$"
              title="Enter +977 followed by exactly 10 digits"
              onKeyDown={(e) => {
                // Prevent extra digits beyond 10 (ignores +977)
                const isDigit = /\d/.test(e.key)
                if (!isDigit) return
                const digits = phone.replace(/^\+977/, '')
                if (digits.length >= 10) e.preventDefault()
              }}
              inputMode="numeric"
              required
              className="rider-input"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rider-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length < 13 || password.length < 1}
            className="rider-btn rider-btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <footer className="mt-8 pt-6 border-t border-[#2a221c]">
          <p className="text-xs text-gray-500 text-center">
            Contact your admin to create an account
          </p>
        </footer>
      </div>
    </div>
  )
}

