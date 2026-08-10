import { create } from 'zustand';

const loadNotifications = () => {
  try {
    const stored = localStorage.getItem('jhyaap_notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((n) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
  } catch {}
  return [];
};

const saveNotifications = (notifications) => {
  localStorage.setItem('jhyaap_notifications', JSON.stringify(notifications));
};

export const useNotificationStore = create((set, get) => ({
  notifications: loadNotifications(),
  unreadCount: loadNotifications().filter(n => !n.read).length,

  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    
    const updated = [newNotification, ...get().notifications].slice(0, 50); // Keep last 50
    set({ notifications: updated, unreadCount: updated.filter(n => !n.read).length });
    saveNotifications(updated);
    
    // Play notification sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      const playBeep = (times) => {
        if (times <= 0) { audioContext.close(); return; }
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.1);
        setTimeout(() => {
          oscillator.frequency.value = 800;
          gainNode.gain.value = 0.3;
          playBeep(times - 1);
        }, 200);
      };
      playBeep(3);
    } catch (err) {
      console.log('Audio play failed:', err);
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🛎️ ${notification.title}`, {
        body: notification.message,
        icon: '/icon-192.png',
        requireInteraction: true,
      });
    }
  },

  markAsRead: (id) => {
    const updated = get().notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    set({ notifications: updated, unreadCount: updated.filter(n => !n.read).length });
    saveNotifications(updated);
  },

  markAllAsRead: () => {
    const updated = get().notifications.map(n => ({ ...n, read: true }));
    set({ notifications: updated, unreadCount: 0 });
    saveNotifications(updated);
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
    saveNotifications([]);
  },

  getNotificationsByType: (type) => {
    return get().notifications.filter(n => n.type === type);
  },
}));
