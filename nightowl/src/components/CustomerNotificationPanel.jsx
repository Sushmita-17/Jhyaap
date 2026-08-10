import { useEffect, useState } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/store/authStore';

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

export default function CustomerNotificationPanel({ isOpen, onClose }) {
  const { user: contextUser } = useAuth();
  const storeUser = useAuthStore((state) => state.user);
  const user = contextUser || storeUser;
  const [notifications, setNotifications] = useState([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('jhyaap_access_token') : null;

  useEffect(() => {
    if (!isOpen || !user?.id) return;
    let active = true;
    fetch(`${API_BASE}/api/v1/notifications/customer/${encodeURIComponent(user.id)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load notifications')))
      .then((data) => { if (active) setNotifications(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setNotifications([]); });
    return () => { active = false; };
  }, [isOpen, user?.id, token]);

  const markAsRead = async (id) => {
    await fetch(`${API_BASE}/api/v1/notifications/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ is_read: true }),
    });
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, is_read: true } : item));
  };

  const deleteNotification = async (id) => {
    await fetch(`${API_BASE}/api/v1/notifications/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setNotifications((items) => items.filter((item) => item.id !== id));
  };

  if (!isOpen) return null;
  return (
    <div className="w-80 max-h-96 overflow-hidden rounded-2xl border border-white/10 bg-[#0D0D0D] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 p-4 text-white">
        <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-[#C9A84C]" /><span className="font-semibold">Notifications</span></div>
        <button onClick={onClose} aria-label="Close notifications"><X className="h-4 w-4" /></button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-400">No notifications yet.</p>
        ) : notifications.map((notification) => (
          <div key={notification.id} className={`border-b border-white/5 p-4 ${notification.is_read ? '' : 'bg-[#C9A84C]/10'}`}>
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-sm font-medium text-white">{notification.title}</p><p className="mt-1 text-xs text-gray-400">{notification.message}</p></div>
              <div className="flex shrink-0 gap-2">
                {!notification.is_read && <button onClick={() => markAsRead(notification.id)} aria-label="Mark as read"><Check className="h-4 w-4 text-green-400" /></button>}
                <button onClick={() => deleteNotification(notification.id)} aria-label="Delete notification"><Trash2 className="h-4 w-4 text-gray-500" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
