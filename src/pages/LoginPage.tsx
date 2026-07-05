import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { Page } from '@/types';
import {
    CheckCircle2,
    ChevronLeft,
    Eye,
    EyeOff,
    LockKeyhole,
    Phone,
    UserPlus,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const pagePaths: Record<Page, string> = {
  home: '/',
  products: '/products',
  product: '/products',
  cart: '/cart',
  checkout: '/checkout',
  'order-tracking': '/order-tracking',
  profile: '/profile',
  login: '/login',
  search: '/products',
  categories: '/products',
  orders: '/profile',
  about: '/about',
  faqs: '/faqs',
  contact: '/contact',
  reviews: '/reviews',
};

type View =
  | 'signin'
  | 'signup-phone'
  | 'signup-otp'
  | 'signup-profile'
  | 'forgot-phone'
  | 'forgot-otp'
  | 'forgot-reset'
  | 'success';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 120;

function passwordScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

function isAdult(dob: string) {
  if (!dob) return false;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 18;
}

export default function LoginPage() {
  const { login, signup, resetPassword, findUserByPhone, updateProfile } = useAuthStore();
  const { setPage, postLoginPage, setPostLoginPage } = useAppStore();
  const navigate = useNavigate();

  const [view, setView] = useState<View>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign-in fields
  const [signinPhone, setSigninPhone] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [showSigninPassword, setShowSigninPassword] = useState(false);

  // Shared phone/OTP fields (used by signup and forgot-password)
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);

  // Signup profile fields
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Forgot-password reset fields
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    if (view !== 'signup-otp' && view !== 'forgot-otp') return;
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [view, resendIn]);

  const resetOtpState = () => {
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setResendIn(RESEND_SECONDS);
  };

  const goTo = (next: View) => {
    setError(null);
    setView(next);
  };

  const finishAuth = () => {
    const next = postLoginPage || 'home';
    setPostLoginPage(null);
    setPage(next);
    navigate(pagePaths[next]);
  };

  // ---------- Mock OTP sender (swap for your real SMS gateway, e.g. Sparrow SMS) ----------
  const sendOtp = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // eslint-disable-next-line no-console
    console.log('[Jhyaap Station mock OTP]', code); // dev-only stand-in for SMS delivery
    setGeneratedOtp(code);
    setOtpExpiresAt(Date.now() + RESEND_SECONDS * 1000);
    resetOtpState();
  };

  // ---------- Sign in ----------
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signinPhone.length < 10 || signinPassword.length < 1) return;
    setIsLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 400));
    const err = login(signinPhone, signinPassword);
    setIsLoading(false);
    if (err) {
      setError(err);
      return;
    }
    finishAuth();
  };

  // ---------- Signup: phone ----------
  const handleSignupSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    if (findUserByPhone(phone)) {
      setError('An account with this phone number already exists. Try signing in instead.');
      return;
    }
    setIsLoading(true);
    setError(null);
    await sendOtp();
    setIsLoading(false);
    goTo('signup-otp');
  };

  // ---------- Forgot password: phone ----------
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    if (!findUserByPhone(phone)) {
      setError('No account found for this phone number.');
      return;
    }
    setIsLoading(true);
    setError(null);
    await sendOtp();
    setIsLoading(false);
    goTo('forgot-otp');
  };

  // ---------- OTP box handling (shared) ----------
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const otpCode = otpDigits.join('');

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < OTP_LENGTH) return;
    setIsLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 500));
    setIsLoading(false);

    if (Date.now() > otpExpiresAt) {
      setError('This code has expired. Tap resend to get a new one.');
      return;
    }
    if (otpCode !== generatedOtp) {
      setError('Incorrect code. Please try again.');
      return;
    }

    if (view === 'signup-otp') {
      goTo('signup-profile');
    } else if (view === 'forgot-otp') {
      goTo('forgot-reset');
    }
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    setIsLoading(true);
    await sendOtp();
    setIsLoading(false);
  };

  // ---------- Signup: profile + password ----------
  const signupPwScore = passwordScore(signupPassword);
  const canCreateAccount =
    fullName.trim().length >= 2 &&
    dob.length > 0 &&
    isAdult(dob) &&
    signupPassword.length >= 8 &&
    signupPassword === confirmPassword;

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdult(dob)) {
      setError('You must be 18 or older to create a Jhyaap Station account.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords don\'t match.');
      return;
    }
    setIsLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 500));
    const err = signup({
      phone,
      password: signupPassword,
      name: fullName.trim(),
      dob,
      email,
      authMethod: 'phone',
    });
    setIsLoading(false);
    if (err) {
      setError(err);
      return;
    }
    goTo('success');
  };

  // ---------- Forgot password: reset ----------
  const canResetPassword = resetPasswordValue.length >= 8 && resetPasswordValue === resetConfirm;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canResetPassword) return;
    setIsLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 500));
    const err = resetPassword(phone, resetPasswordValue);
    setIsLoading(false);
    if (err) {
      setError(err);
      return;
    }
    goTo('signin');
    setSigninPhone(phone);
    setSigninPassword('');
    setError('Password updated. Please sign in with your new password.');
  };

  const handleContinueToStore = () => {
    finishAuth();
  };

  // ---------- Back button behavior ----------
  const handleBack = () => {
    setError(null);
    switch (view) {
      case 'signin':
        setPage('home');
        break;
      case 'signup-phone':
      case 'forgot-phone':
        setView('signin');
        break;
      case 'signup-otp':
        setView('signup-phone');
        break;
      case 'forgot-otp':
        setView('forgot-phone');
        break;
      case 'signup-profile':
        setView('signup-otp');
        break;
      case 'forgot-reset':
        setView('forgot-otp');
        break;
      default:
        setView('signin');
    }
  };

  const backLabel = view === 'signin' ? 'Back to home' : 'Back';

  return (
    <div className="min-h-screen bg-night-950 text-night-100">
      <div className="max-w-5xl mx-auto grid min-h-[calc(100vh-96px)] gap-8 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="hidden rounded-2xl border border-night-600/40 bg-night-900/70 p-8 lg:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Jhyaap Station</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Sign in once. Checkout faster every time.</h1>
          <p className="mt-4 text-sm leading-7 text-night-300">
            Your account keeps delivery details, order tracking, and profile information ready for the next order.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Phone number + password sign in',
              'Saved profile for faster checkout',
              'Order history and delivery tracking',
            ].map((item) => (
              <div key={item} className="rounded-xl bg-night-950/50 p-4 text-sm text-night-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-night-600/40 bg-night-900/70 p-5 sm:p-8">
          {view !== 'success' && (
            <button onClick={handleBack} className="mb-6 inline-flex items-center gap-2 text-sm text-night-300 hover:text-neon-amber">
              <ChevronLeft className="h-4 w-4" />
              {backLabel}
            </button>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* ---------------- SIGN IN ---------------- */}
          {view === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-amber/10 text-neon-amber">
                  <Phone className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Sign in</p>
                <h2 className="mt-2 text-3xl font-bold text-white">Welcome back</h2>
                <p className="mt-2 text-sm text-night-300">Sign in with your phone number and password.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-night-200">Phone Number</label>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl border border-night-600/50 bg-night-950 px-4 py-3 text-night-300">+977</span>
                  <input
                    type="tel"
                    value={signinPhone}
                    onChange={(e) => setSigninPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9800000000"
                    maxLength={10}
                    className="input-field flex-1"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-night-200">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setPhone(signinPhone);
                      goTo('forgot-phone');
                    }}
                    className="text-xs font-semibold text-neon-amber hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSigninPassword ? 'text' : 'password'}
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field w-full pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSigninPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-night-400 hover:text-night-200"
                    aria-label={showSigninPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSigninPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={signinPhone.length < 10 || signinPassword.length < 1 || isLoading}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>

              <p className="text-center text-sm text-night-300">
                New here?{' '}
                <button
                  type="button"
                  onClick={() => goTo('signup-phone')}
                  className="font-semibold text-neon-amber hover:underline"
                >
                  Create an account
                </button>
              </p>
            </form>
          )}

          {/* ---------------- SIGNUP STEP 1: PHONE ---------------- */}
          {view === 'signup-phone' && (
            <form onSubmit={handleSignupSendOtp} className="space-y-5">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-amber/10 text-neon-amber">
                  <Phone className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Create account</p>
                <h2 className="mt-2 text-3xl font-bold text-white">What's your number?</h2>
                <p className="mt-2 text-sm text-night-300">We'll text you a one-time code to verify it.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-night-200">Phone Number</label>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl border border-night-600/50 bg-night-950 px-4 py-3 text-night-300">+977</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9800000000"
                    maxLength={10}
                    className="input-field flex-1"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phone.length < 10 || isLoading}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Sending code...' : 'Send OTP'}
              </button>

              <p className="text-center text-xs leading-5 text-night-500">
                By continuing, you confirm you are of legal drinking age and agree to our Terms of Service and
                Privacy Policy.
              </p>
            </form>
          )}

          {/* ---------------- FORGOT PASSWORD STEP 1: PHONE ---------------- */}
          {view === 'forgot-phone' && (
            <form onSubmit={handleForgotSendOtp} className="space-y-5">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-amber/10 text-neon-amber">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Reset password</p>
                <h2 className="mt-2 text-3xl font-bold text-white">Confirm your number</h2>
                <p className="mt-2 text-sm text-night-300">We'll send a code to verify it's you.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-night-200">Phone Number</label>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl border border-night-600/50 bg-night-950 px-4 py-3 text-night-300">+977</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9800000000"
                    maxLength={10}
                    className="input-field flex-1"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phone.length < 10 || isLoading}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Sending code...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* ---------------- OTP (shared: signup / forgot) ---------------- */}
          {(view === 'signup-otp' || view === 'forgot-otp') && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-amber/10 text-neon-amber">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-white">Enter the code</h2>
                <p className="mt-2 text-sm text-night-300">We sent a {OTP_LENGTH}-digit code to +977 {phone}.</p>
                {/* DEV-ONLY: no real SMS gateway is wired up yet, so the mock code is
                    shown here instead of being texted. Remove this block once a real
                    OTP/SMS provider is connected. */}
                {generatedOtp && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-neon-amber/30 bg-neon-amber/10 px-3 py-2 text-sm">
                    <span className="text-night-300">Dev mode — your code is</span>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = generatedOtp.split('');
                        setOtpDigits(digits);
                        otpRefs.current[digits.length - 1]?.focus();
                      }}
                      className="font-mono font-bold tracking-widest text-neon-amber hover:underline"
                      title="Click to auto-fill"
                    >
                      {generatedOtp}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-2">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    maxLength={1}
                    autoFocus={i === 0}
                    className="input-field h-14 w-12 text-center text-xl tracking-widest"
                  />
                ))}
              </div>

              <div className="text-center text-sm text-night-400">
                {resendIn > 0 ? (
                  <span>
                    Resend code in {Math.floor(resendIn / 60)}:{String(resendIn % 60).padStart(2, '0')}
                  </span>
                ) : (
                  <button type="button" onClick={handleResend} className="font-semibold text-neon-amber hover:underline">
                    Resend code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={otpCode.length < OTP_LENGTH || isLoading}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & continue'}
              </button>
            </form>
          )}

          {/* ---------------- SIGNUP STEP 3: PROFILE + PASSWORD ---------------- */}
          {view === 'signup-profile' && (
            <form onSubmit={handleCreateAccount} className="space-y-5">
              <div>
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300 w-fit">
                  <CheckCircle2 className="h-4 w-4" />
                  Phone verified
                </div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-amber/10 text-neon-amber">
                  <UserPlus className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-white">Finish your profile</h2>
                <p className="mt-2 text-sm text-night-300">A few more details and you're set.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-night-200">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="input-field w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-night-200">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="input-field w-full"
                />
                {dob && !isAdult(dob) && (
                  <p className="mt-1 text-xs text-red-400">You must be 18 or older to use Jhyaap Station.</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-night-200">
                  Email <span className="text-night-500 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-night-200">Password</label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="input-field w-full pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-night-400 hover:text-night-200"
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signupPassword.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < signupPwScore
                            ? signupPwScore <= 1
                              ? 'bg-red-500'
                              : signupPwScore === 2
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                            : 'bg-night-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-night-200">Confirm Password</label>
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="input-field w-full"
                />
                {confirmPassword.length > 0 && confirmPassword !== signupPassword && (
                  <p className="mt-1 text-xs text-red-400">Passwords don't match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!canCreateAccount || isLoading}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}

          {/* ---------------- FORGOT PASSWORD STEP 3: RESET ---------------- */}
          {view === 'forgot-reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-amber/10 text-neon-amber">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-white">Set a new password</h2>
                <p className="mt-2 text-sm text-night-300">Choose something you haven't used before.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-night-200">New Password</label>
                <input
                  type="password"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  placeholder="At least 8 characters"
                  className="input-field w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-night-200">Confirm New Password</label>
                <input
                  type="password"
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  placeholder="Re-enter new password"
                  className="input-field w-full"
                />
                {resetConfirm.length > 0 && resetConfirm !== resetPasswordValue && (
                  <p className="mt-1 text-xs text-red-400">Passwords don't match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!canResetPassword || isLoading}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}

          {/* ---------------- SUCCESS ---------------- */}
          {view === 'success' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">You're in</h2>
                <p className="mt-2 text-sm leading-6 text-night-300">
                  Your saved addresses, order tracking, and faster checkout are now active on this account.
                </p>
              </div>
              <button onClick={handleContinueToStore} className="btn-primary w-full">
                Back to store
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}