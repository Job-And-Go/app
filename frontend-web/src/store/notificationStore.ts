import { create } from 'zustand';

interface NotificationState {
  message: string | null;
  type: 'success' | 'error' | null;
  setNotification: (message: string | null, type: 'success' | 'error' | null) => void;
  clearNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: null,
  type: null,
  setNotification: (message, type) => set({ message, type }),
  clearNotification: () => set({ message: null, type: null }),
})); 