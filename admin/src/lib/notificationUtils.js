/**
 * Notification utility for browser and mobile notifications with sound
 * Supports Web Push API and in-app floating notifications
 */

// Audio context for playing notification sounds
let audioContext = null;

/**
 * Initialize audio context for sound playback
 */
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play notification sound using Web Audio API
 * Creates a pleasant but attention-grabbing chime sound
 */
export function playNotificationSound() {
  try {
    const ctx = initAudioContext();
    
    // Create oscillator for the main tone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Set frequency for a pleasant chime (C5 to E5)
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    
    // Set volume envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.type = 'sine';
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
    
    // Play a second chime for emphasis
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
      osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
      
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc2.type = 'sine';
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.4);
    }, 200);
    
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

/**
 * Request notification permission from the user
 * @returns {Promise<boolean>} - True if permission granted
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show browser notification with sound
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} options - Additional notification options
 */
export async function showBrowserNotification(title, body, options = {}) {
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return;
  }

  // Play sound
  playNotificationSound();

  // Show notification
  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200], // Vibration pattern for mobile
    requireInteraction: true,
    ...options,
  });

  // Auto-close after 10 seconds
  setTimeout(() => notification.close(), 10000);

  // Handle click
  notification.onclick = () => {
    window.focus();
    notification.close();
    if (options.onClick) {
      options.onClick();
    }
  };
}

/**
 * Check if notifications are supported
 * @returns {boolean}
 */
export function isNotificationSupported() {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 * @returns {string} - 'granted', 'denied', or 'default'
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'not-supported';
  return Notification.permission;
}
