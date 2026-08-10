import Cookies from 'js-cookie';

// Session configuration
const SESSION_CONFIG = {
  cookieName: 'jhyaap_session',
  cookieOptions: {
    expires: 7, // 7 days
    secure: typeof process !== 'undefined' ? process.env?.NODE_ENV === 'production' : import.meta.env.PROD,
    sameSite: 'strict',
    path: '/'
  },
  sessionTimeout: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

class SessionManager {
  constructor() {
    this.session = null;
    this.listeners = new Set();
  }

  // Create session
  createSession(userData) {
    const sessionData = {
      id: this.generateSessionId(),
      userId: userData.id,
      role: userData.role,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_CONFIG.sessionTimeout).toISOString(),
      lastActivity: new Date().toISOString()
    };

    // Store in cookie
    Cookies.set(SESSION_CONFIG.cookieName, JSON.stringify(sessionData), SESSION_CONFIG.cookieOptions);
    
    this.session = sessionData;
    this.notifyListeners();
    
    return sessionData;
  }

  // Get current session
  getSession() {
    if (this.session) {
      // Check if session is still valid
      if (this.isSessionValid(this.session)) {
        return this.session;
      } else {
        this.destroySession();
        return null;
      }
    }

    // Try to get from cookie
    const sessionCookie = Cookies.get(SESSION_CONFIG.cookieName);
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(sessionCookie);
        if (this.isSessionValid(sessionData)) {
          this.session = sessionData;
          return sessionData;
        } else {
          this.destroySession();
          return null;
        }
      } catch (error) {
        console.error('Error parsing session:', error);
        this.destroySession();
        return null;
      }
    }

    return null;
  }

  // Update session activity
  updateActivity() {
    const session = this.getSession();
    if (session) {
      session.lastActivity = new Date().toISOString();
      // Update cookie with new activity timestamp
      Cookies.set(SESSION_CONFIG.cookieName, JSON.stringify(session), SESSION_CONFIG.cookieOptions);
      this.session = session;
    }
  }

  // Check if session is valid
  isSessionValid(session) {
    if (!session) return false;
    
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    return now < expiresAt;
  }

  // Destroy session
  destroySession() {
    Cookies.remove(SESSION_CONFIG.cookieName, { path: '/' });
    this.session = null;
    this.notifyListeners();
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.getSession() !== null;
  }

  // Get user role
  getUserRole() {
    const session = this.getSession();
    return session ? session.role : null;
  }

  // Check if user has specific role
  hasRole(role) {
    const session = this.getSession();
    return session ? session.role === role : false;
  }

  // Get user data
  getUserData() {
    const session = this.getSession();
    if (!session) return null;
    
    return {
      id: session.userId,
      role: session.role,
      name: session.name,
      email: session.email,
      phone: session.phone
    };
  }

  // Add session change listener
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.session));
  }

  // Generate unique session ID
  generateSessionId() {
    return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // Session middleware for API calls
  getSessionForAPI() {
    const session = this.getSession();
    if (!session) {
      return null;
    }
    
    return {
      'Authorization': `Bearer ${session.id}`,
      'X-Session-ID': session.id,
      'X-User-Role': session.role
    };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Export session manager for use in components
export default sessionManager;
