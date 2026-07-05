import { User } from '@/types';
import { create } from 'zustand';

interface SignupInput {
  phone: string;
  password: string;
  name: string;
  dob: string;
  email?: string;
  authMethod?: 'phone' | 'google';
}

interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  /** Phone number on the Google account, if Google ever supplies one. Usually absent. */
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** Returns an error message string, or null on success. */
  signup: (input: SignupInput) => string | null;
  /** Returns an error message string, or null on success. */
  login: (phone: string, password: string) => string | null;
  /**
   * Starts or continues a Google sign-in. If the Google account is already linked
   * to a verified phone, logs the user in directly. Otherwise returns a token the
   * UI should hold onto and pass to `attachPhoneToGoogleAccount` once OTP verification
   * completes.
   */
  loginWithGoogle: (profile: GoogleProfile) => { status: 'logged_in' | 'needs_phone'; pendingToken?: string; error?: string };
  /** Call after OTP verification succeeds for a Google account with no phone on file. */
  attachPhoneToGoogleAccount: (pendingToken: string, phone: string) => string | null;
  /** Resets the password for an already-OTP-verified phone number. */
  resetPassword: (phone: string, newPassword: string) => string | null;
  /** Changes the password for the currently signed-in user, requiring the current password. */
  changePassword: (currentPassword: string, newPassword: string) => string | null;
  findUserByPhone: (phone: string) => User | undefined;
  logout: () => void;
  updateProfile: (user: Partial<User>) => void;
}

const USERS_KEY = 'jhyaap_users';
const SESSION_KEY = 'jhyaap_session';
const PENDING_GOOGLE_KEY = 'jhyaap_pending_google';

const generateUserId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('977')) {
    return digits.slice(-10);
  }
  return digits;
};

// ---- localStorage helpers (swap internals for real API calls later) ----

const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const findUserByPhoneRaw = (phone: string): User | undefined => {
  const target = normalizePhone(phone);
  return getUsers().find((u) => normalizePhone(u.phone) === target);
};

const findUserByGoogleId = (googleId: string): User | undefined => {
  return getUsers().find((u) => u.googleId === googleId);
};

const upsertUser = (user: User) => {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  saveUsers(users);
};

const loadSession = (): User | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored);
    const user = findUserByPhoneRaw(session.phone) ?? null;
    // Defense in depth: never resume a session for an unverified phone.
    if (user && !user.phoneVerified) return null;
    return user;
  } catch {
    return null;
  }
};

const saveSession = (user: User) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ phone: user.phone, loggedInAt: new Date().toISOString() }));
};

const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// Pending Google signups that still need phone verification before they become real users.
const savePendingGoogle = (token: string, profile: GoogleProfile) => {
  const all = JSON.parse(localStorage.getItem(PENDING_GOOGLE_KEY) || '{}');
  all[token] = profile;
  localStorage.setItem(PENDING_GOOGLE_KEY, JSON.stringify(all));
};

const readPendingGoogle = (token: string): GoogleProfile | undefined => {
  const all = JSON.parse(localStorage.getItem(PENDING_GOOGLE_KEY) || '{}');
  return all[token];
};

const clearPendingGoogle = (token: string) => {
  const all = JSON.parse(localStorage.getItem(PENDING_GOOGLE_KEY) || '{}');
  delete all[token];
  localStorage.setItem(PENDING_GOOGLE_KEY, JSON.stringify(all));
};

// --------------------------------------------------------------------

export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadSession(),
  isAuthenticated: !!loadSession(),

  signup: ({ phone, password, name, dob, email, authMethod }) => {
    if (findUserByPhoneRaw(phone)) {
      return 'An account with this phone number already exists. Try signing in instead.';
    }
    const newUser: User = {
      id: generateUserId(),
      phone: `+977${normalizePhone(phone)}`,
      email: email?.trim() || `${normalizePhone(phone)}@jhyaap.local`,
      name,
      dob,
      password,
      authMethod: authMethod ?? 'phone',
      phoneVerified: true, // signup only reaches the store after OTP verification in the UI
      walletBalance: 0,
    };
    upsertUser(newUser);
    saveSession(newUser);
    set({ user: newUser, isAuthenticated: true });
    return null;
  },

  login: (phone: string, password: string) => {
    const existing = findUserByPhoneRaw(phone);
    if (!existing || existing.password !== password) {
      return 'Phone number or password is incorrect.';
    }
    if (!existing.phoneVerified) {
      return 'This account still needs phone verification. Please complete signup again.';
    }
    saveSession(existing);
    set({ user: existing, isAuthenticated: true });
    return null;
  },

  loginWithGoogle: (profile: GoogleProfile) => {
    const existing = findUserByGoogleId(profile.googleId);
    if (existing) {
      if (!existing.phoneVerified) {
        // Shouldn't normally happen, but guard anyway: re-enter the phone-verify flow.
        const token = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        savePendingGoogle(token, profile);
        return { status: 'needs_phone', pendingToken: token };
      }
      saveSession(existing);
      set({ user: existing, isAuthenticated: true });
      return { status: 'logged_in' };
    }

    // No account for this Google ID yet. If Google happened to supply a phone
    // number and it's already registered, link the accounts directly.
    if (profile.phone) {
      const byPhone = findUserByPhoneRaw(profile.phone);
      if (byPhone) {
        const linked = { ...byPhone, googleId: profile.googleId };
        upsertUser(linked);
        saveSession(linked);
        set({ user: linked, isAuthenticated: true });
        return { status: 'logged_in' };
      }
    }

    // New Google identity with no verified phone on file: stash it and make the
    // UI run the OTP step before we create a real account.
    const token = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    savePendingGoogle(token, profile);
    return { status: 'needs_phone', pendingToken: token };
  },

  attachPhoneToGoogleAccount: (pendingToken: string, phone: string) => {
    const profile = readPendingGoogle(pendingToken);
    if (!profile) {
      return 'This sign-in session expired. Please try Google sign-in again.';
    }
    if (findUserByPhoneRaw(phone)) {
      return 'An account with this phone number already exists. Try signing in instead.';
    }
    const newUser: User = {
      id: generateUserId(),
      phone: `+977${normalizePhone(phone)}`,
      email: profile.email,
      name: profile.name,
      dob: '', // Google signup still needs DOB collected for the age gate; surface this in your profile-completion UI
      googleId: profile.googleId,
      authMethod: 'google',
      phoneVerified: true,
      walletBalance: 0,
    };
    upsertUser(newUser);
    saveSession(newUser);
    clearPendingGoogle(pendingToken);
    set({ user: newUser, isAuthenticated: true });
    return null;
  },

  resetPassword: (phone: string, newPassword: string) => {
    const existing = findUserByPhoneRaw(phone);
    if (!existing) {
      return 'No account found for this phone number.';
    }
    const updated = { ...existing, password: newPassword };
    upsertUser(updated);
    return null;
  },

  changePassword: (currentPassword: string, newPassword: string) => {
    const current = get().user;
    if (!current) {
      return 'You must be signed in to change your password.';
    }
    if (!current.password || current.password !== currentPassword) {
      return 'Current password is incorrect.';
    }
    if (newPassword.length < 8) {
      return 'New password must be at least 8 characters.';
    }
    if (newPassword === currentPassword) {
      return 'New password must be different from your current password.';
    }
    const updated = { ...current, password: newPassword };
    upsertUser(updated);
    set({ user: updated });
    return null;
  },

  findUserByPhone: (phone: string) => findUserByPhoneRaw(phone),

  logout: () => {
    clearSession();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (updates: Partial<User>) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...updates };
      upsertUser(updated);
      saveSession(updated);
      set({ user: updated });
    }
  },
}));