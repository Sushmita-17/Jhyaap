import { useState, useEffect } from 'react';
import { Bell, X, Package, MapPin, CheckCircle, Clock } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerNotificationIcon() {
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuth();
  const isLight = theme === 'light';
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (!isAuthenticated) return;

    // Request notification permission when logged in
    const requestPermission = async () => {
      if ('Notification' in window) {
        const result = await Notification.requestPermission();
        setPermission(result);
      }
    };

    requestPermission();

    setNotifications([]);
    setUnreadCount(0);

  }, [isAuthenticated, permission]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return null; // Don't show notification icon if not logged in
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 rounded-lg transition-colors border-none cursor-pointer ${
          isLight 
            ? 'hover:bg-gray-100 text-gray-600' 
            : 'hover:bg-white/10 text-gray-300'
        }`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className={`absolute right-0 top-full mt-2 w-80 rounded-lg border shadow-xl z-20 ${
            isLight 
              ? 'bg-white border-gray-200' 
              : 'bg-gray-800 border-gray-700'
          }`}>
            <div className={`p-4 border-b ${
              isLight ? 'border-gray-200' : 'border-gray-700'
            }`}>
              <div className="flex justify-between items-center">
                <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className={`text-xs ${
                      isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
                    }`}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className={`mx-auto h-8 w-8 mb-2 ${isLight ? 'text-gray-400' : 'text-gray-600'}`} />
                  <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    No notifications
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      isLight 
                        ? 'border-gray-100 hover:bg-gray-50' 
                        : 'border-gray-700 hover:bg-gray-700/50'
                    } ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {notification.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 ml-2 flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                            {formatTime(notification.time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={`p-3 border-t ${
              isLight ? 'border-gray-200' : 'border-gray-700'
            }`}>
              <button
                className={`w-full text-center text-sm ${
                  isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
                }`}
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

