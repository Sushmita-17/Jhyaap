import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { loginCustomer, requestOtp, verifyOtp, completeCustomerProfile } from '@/lib/jhyaapAuthAPI';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

const normalizePhone = (value) => {
  if (!value) throw new Error('Phone number is required.');
  const trimmed = value.trim().replace(/\s/g, '');
  if (trimmed.startsWith('+') && !trimmed.startsWith('+977')) {
    throw new Error('Only Nepal phone numbers with +977 are allowed.');
  }
  const digits = trimmed.replace(/\D/g, '');
  const localNumber = digits.startsWith('977') ? digits.slice(3) : digits;
  if (!/^9\d{9}$/.test(localNumber)) {
    throw new Error('Enter a valid Nepal mobile number, for example +977 98XXXXXXXX.');
  }
  return `+977${localNumber}`;
};

export default function LoginPage() {
  const theme = useThemeStore((state) => state.theme);
  const isLight = theme === 'light';
  const setBackendSession = useAuthStore((state) => state.setBackendSession);
  const [mode, setMode] = useState('signin');
  const [phone, setPhone] = useState('+977 ');
  const [confirmPhone, setConfirmPhone] = useState('+977 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [step, setStep] = useState('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const finish = (customer, token) => {
    setBackendSession(customer, token);
    window.location.href = '/';
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        const fullPhone = normalizePhone(phone);
        const result = await loginCustomer(fullPhone, password);
        finish(result.customer, result.access_token);
        return;
      }

      if (step === 'phone') {
        const fullPhone = normalizePhone(phone);
        const res = await requestOtp(fullPhone);
        if (res?.otp_code) {
          setDevOtp(res.otp_code);
          setOtp(res.otp_code); // Auto-fill OTP in dev mode for convenience
          console.log(`%c🔑 DEV OTP Code for ${fullPhone}: ${res.otp_code}`, 'color: #C9A84C; font-size: 18px; font-weight: bold; background: #000; padding: 4px 8px; border-radius: 4px;');
        }
        setConfirmPhone(phone);
        setStep('otp');
        return;
      }

      if (step === 'otp') {
        const fullPhone = normalizePhone(phone);
        const result = await verifyOtp(fullPhone, otp);
        setCustomerId(result.customer_id);
        setAccessToken(result.access_token);
        setStep('profile');
        return;
      }

      if (step === 'profile') {
        const fullConfirmPhone = normalizePhone(confirmPhone);
        
        if (password !== confirmPassword) {
          throw new Error('Create password and Confirm password do not match.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const customer = await completeCustomerProfile(customerId, accessToken, {
          name: name.trim(),
          phone_number: fullConfirmPhone,
          email: email.trim() || null,
          password,
          confirm_password: confirmPassword,
        });

        finish(customer, accessToken);
      }
    } catch (err) {
      const msg = typeof err?.message === 'string' ? err.message : String(err);
      setError(msg || 'Unable to complete authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex min-h-[70vh] items-center justify-center px-4 py-10 transition-colors duration-300 ${isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]'}`}>
      <form onSubmit={submit} className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-colors duration-300 ${isLight ? 'border-gray-200 bg-white' : 'border-white/10 bg-[#141414]'}`}>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C]">Jhyaap Station</p>
        <h1 className={`mt-2 text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
          {mode === 'signin' ? 'Sign in' : step === 'profile' ? 'Complete profile' : 'Create account'}
        </h1>

        {error && (
          <p className={`mt-4 rounded-lg p-3 text-sm ${isLight ? 'bg-red-50 text-red-700' : 'bg-red-500/10 text-red-300'}`}>
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </p>
        )}

        {mode === 'signup' && step === 'profile' ? (
          <div className="mt-6 space-y-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Full Name</label>
              <input
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className={`w-full rounded-lg border p-3 ${isLight ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400' : 'border-white/10 bg-black/30 text-white placeholder:text-gray-400'}`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Re-enter Phone Number</label>
              <input
                required
                value={confirmPhone}
                onChange={(e) => setConfirmPhone(e.target.value)}
                placeholder="+977 98XXXXXXXX"
                className={`w-full rounded-lg border p-3 ${isLight ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400' : 'border-white/10 bg-black/30 text-white placeholder:text-gray-400'}`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address (optional)"
                className={`w-full rounded-lg border p-3 ${isLight ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400' : 'border-white/10 bg-black/30 text-white placeholder:text-gray-400'}`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Create Password</label>
              <div className="relative">
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password (min 6 characters)"
                  className={`w-full rounded-lg border p-3 pr-10 ${isLight ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400' : 'border-white/10 bg-black/30 text-white placeholder:text-gray-400'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-500 hover:text-gray-700' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Confirm Password</label>
              <div className="relative">
                <input
                  required
                  minLength={6}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className={`w-full rounded-lg border p-3 pr-10 ${isLight ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400' : 'border-white/10 bg-black/30 text-white placeholder:text-gray-400'}`}
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
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Phone Number</label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+977 98XXXXXXXX"
                className={`w-full rounded-lg border p-3 ${isLight ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400' : 'border-white/10 bg-black/30 text-white placeholder:text-gray-400'}`}
              />
            </div>

            {mode === 'signin' && (
              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Password</label>
                <div className="relative">
                  <input
                    required
                    type={showLoginPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={`w-full rounded-lg border p-3 pr-10 ${isLight ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400' : 'border-white/10 bg-black/30 text-white placeholder:text-gray-400'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-500 hover:text-gray-700' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && step === 'otp' && (
              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>OTP Code</label>
                <input
                  required
                  minLength={6}
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit OTP"
                  className={`w-full rounded-lg border p-3 ${isLight ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400' : 'border-white/10 bg-black/30 text-white placeholder:text-gray-400'}`}
                />
                {devOtp && (
                  <div className="mt-2 p-2.5 rounded-lg border border-[#C9A84C]/40 bg-[#C9A84C]/10 text-xs font-medium text-[#C9A84C]">
                    🔑 Dev OTP Code: <strong className="font-bold tracking-widest text-sm ml-1 text-[#D9B85C]">{devOtp}</strong> (Auto-filled & logged in F12 Console)
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <button
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#C9A84C] p-3 font-semibold text-black transition hover:bg-[#D9B85C] disabled:opacity-50"
        >
          {loading
            ? 'Please wait...'
            : mode === 'signin'
            ? 'Sign in'
            : step === 'phone'
            ? 'Send OTP'
            : step === 'otp'
            ? 'Verify OTP'
            : 'Create account'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setStep('phone');
            setError('');
          }}
          className="mt-4 w-full text-sm text-[#C9A84C]"
        >
          {mode === 'signin' ? 'Create a new account' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
