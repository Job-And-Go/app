import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';

export default function Notification() {
  const { message, type, clearNotification } = useNotificationStore();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message, clearNotification]);

  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`px-6 py-3 rounded-md shadow-lg ${
          type === 'success' ? 'bg-theme-primary' : 'bg-red-500'
        } text-white text-sm font-medium`}
      >
        {message}
      </div>
    </div>
  );
} 