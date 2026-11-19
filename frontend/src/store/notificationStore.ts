import { create } from 'zustand';

export type NotificationKind = 'success' | 'error' | 'info';

interface NotificationState {
  message: string | null;
  visible: boolean;
  kind: NotificationKind;
  showNotification: (message: string, kind?: NotificationKind) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: null,
  visible: false,
  kind: 'info',
  showNotification: (message, kind = 'success') => set({
    message,
    kind,
    visible: true,
  }),
  hideNotification: () => set({
    message: null,
    visible: false,
  }),
}));
