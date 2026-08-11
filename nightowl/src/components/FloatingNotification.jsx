import { useEffect, useState } from 'react';
import { X, Bell, Package, MapPin, CheckCircle } from 'lucide-react';
import { playNotificationSound } from '@/lib/notificationUtils';

export default function FloatingNotification({ 
  show, 
  onClose, 
  title, 
  message, 
  type = 'info',
  duration = 5000 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      playNotificationSound();
      
      // Auto-close after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300); // Wait for animation
  };

  if (!show) return null;

  const icons = {
    info: Bell,
    success: CheckCircle,
    order: Package,
    location: MapPin,
  };

  const colors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    order: 'bg-[#C9A84C]',
    location: 'bg-amber-500',
  };

  const Icon = icons[type] || Bell;
  const bgColor = colors[type] || 'bg-blue-500';

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: '1px solid rgba(201, 168, 76, 0.3)',
        }}
      >
        {/* Top accent bar */}
        <div className={`h-1 ${bgColor}`} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bgColor}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{message}</p>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close notification"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Pulse animation for attention */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
