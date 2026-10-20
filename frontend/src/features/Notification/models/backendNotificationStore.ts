/**
 * @role: features/model — 백엔드 알림 전역 상태
 * @rule: 알림 목록만 관리, UI 포함 금지
 */
import { create } from 'zustand';
import type { BackendNotification } from '@/widgets/Notification/types/backendNotificationType';

interface BackendNotificationStore {
  notifications: BackendNotification[];
  setNotifications: (notifications: BackendNotification[]) => void;
  addNotification: (notification: BackendNotification) => void;
  addNotifications: (notifications: BackendNotification[]) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  remove: (id: number) => void;
}

export const useBackendNotificationStore = create<BackendNotificationStore>(
  (set) => ({
    notifications: [],
    setNotifications: (notifications) => set({ notifications }),
    addNotification: (notification) =>
      set((state) => ({
        notifications: [notification, ...state.notifications],
      })),
    addNotifications: (incoming) =>
      set((state) => ({
        notifications: [...incoming, ...state.notifications],
      })),
    markAsRead: (id) =>
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
      })),
    markAllAsRead: () =>
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      })),
    remove: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
  }),
);
