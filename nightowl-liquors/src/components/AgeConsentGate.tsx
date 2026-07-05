import { useState } from 'react';
import { ShieldCheck, XCircle } from 'lucide-react';

const STORAGE_KEY = 'jhyaap_age_verified';

export default function AgeConsentGate() {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'blocked'>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true' ? 'accepted' : 'pending';
  });

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setStatus('accepted');
  };

  if (status === 'accepted') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-night-950/95 px-4 backdrop-blur-xl">
      <div className="w-full max-w-md rounded-2xl border border-night-600/50 bg-night-900 p-6 text-center shadow-2xl">
        {status === 'blocked' ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <XCircle className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-white">Sorry — 18+ only</h1>
            <p className="mt-3 text-sm leading-6 text-night-400">
              We can’t sell alcohol to underage visitors. Please close this page.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-amber/10 text-neon-amber">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white">Quick check — are you 18 or older?</h1>
            <p className="mt-3 text-sm leading-6 text-night-400">
              We sell alcohol. Nepali law requires you to be of legal drinking age, and our rider will check ID at the door.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button onClick={accept} className="btn-primary">
                Yes, I’m 18+
              </button>
              <button onClick={() => setStatus('blocked')} className="btn-secondary">
                No, I’m not
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
