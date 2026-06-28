import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LockKeyhole, Phone, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { Page } from '@/types';

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

export default function LoginPage() {
  const { login } = useAuthStore();
  const { setPage, postLoginPage, setPostLoginPage } = useAppStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep('otp');
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep('name');
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 2) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    login(phone, name);
    setIsLoading(false);
    const next = postLoginPage || 'home';
    setPostLoginPage(null);
    setPage(next);
    navigate(pagePaths[next]);
  };

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
              'Phone-based sign in and sign up',
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
          <button onClick={() => (step === 'phone' ? setPage('profile') : setStep(step === 'otp' ? 'phone' : 'otp'))} className="mb-6 inline-flex items-center gap-2 text-sm text-night-300 hover:text-neon-amber">
            <ChevronLeft className="h-4 w-4" />
            {step === 'phone' ? 'Back to profile' : 'Back'}
          </button>

          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-amber/10 text-neon-amber">
                  <Phone className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Sign in / Sign up</p>
                <h2 className="mt-2 text-3xl font-bold text-white">Continue with your phone</h2>
                <p className="mt-2 text-sm text-night-300">Enter your Nepal mobile number to receive a one-time code.</p>
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

              <button type="submit" disabled={phone.length < 10 || isLoading} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
                {isLoading ? 'Sending code...' : 'Send OTP'}
              </button>
              <p className="text-center text-xs leading-5 text-night-500">
                By continuing, you confirm you are eligible to use Jhyaap Station and agree to account verification.
              </p>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-amber/10 text-neon-amber">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-white">Enter OTP</h2>
                <p className="mt-2 text-sm text-night-300">We sent a 4-digit code to +977 {phone}.</p>
              </div>

              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                maxLength={4}
                className="input-field w-full text-center text-2xl tracking-widest"
                autoFocus
              />

              <button type="submit" disabled={otp.length < 4 || isLoading} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button type="button" onClick={() => setStep('phone')} className="btn-secondary w-full">
                Use Different Number
              </button>
            </form>
          )}

          {step === 'name' && (
            <form onSubmit={handleCompleteSignup} className="space-y-5">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-amber/10 text-neon-amber">
                  <UserPlus className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-white">Complete your profile</h2>
                <p className="mt-2 text-sm text-night-300">Add your name so your account and checkout feel personal.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-night-200">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="input-field w-full"
                  autoFocus
                />
              </div>

              <button type="submit" disabled={name.length < 2 || isLoading} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
                {isLoading ? 'Creating account...' : 'Complete Sign Up'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
