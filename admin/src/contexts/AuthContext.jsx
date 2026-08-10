import { createContext, useContext, useState, useEffect } from 'react';
import { sessionManager } from '@/lib/sessionManager';

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const session = sessionManager.getSession();
    if (session) {
      setUser(sessionManager.getUserData());
      setIsAuthenticated(true);
    }
    setLoading(false);

    // Listen for session changes
    const unsubscribe = sessionManager.addListener((session) => {
      if (session) {
        setUser(sessionManager.getUserData());
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) return { success: false, error: body.detail || 'Invalid admin email or password.' };
      const admin = body.admin;
      const userData = {
        id: admin.id,
        role: admin.role || 'admin',
        name: admin.name || admin.email,
        email: admin.email,
        phone: admin.phone_number || '',
      };
      localStorage.setItem('nightowl_admin_token', body.access_token);
      sessionManager.createSession(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Unable to connect to the backend.' };
    }
  };

  const logout = () => {
    sessionManager.destroySession();
    localStorage.removeItem('nightowl_admin_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateActivity = () => {
    sessionManager.updateActivity();
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateActivity,
    hasRole: (role) => sessionManager.hasRole(role),
    getUserRole: () => sessionManager.getUserRole()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

