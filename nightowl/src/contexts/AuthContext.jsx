import { createContext, useContext, useState, useEffect } from 'react';
import { sessionManager } from '@/lib/sessionManager';

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

  const logout = () => {
    sessionManager.destroySession();
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
