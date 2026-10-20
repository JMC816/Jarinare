/**
 * @role: features — 백엔드 알림 목록 조회 및 SSE 실시간 수신
 * @rule: api/ 호출만 담당, UI 포함 금지
 */
import { useEffect } from 'react';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import type { BackendNotification } from '@/widgets/Notification/types/backendNotificationType';
import {
  deleteNotificationApi,
  getNotificationsApi,
  markAllAsReadApi,
  markAsReadApi,
} from '../api/notificationApi';
import { useBackendNotificationStore } from '../models/backendNotificationStore';

const BASE_URL =
  import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

// 모듈 레벨 싱글톤 — 여러 컴포넌트에서 훅을 호출해도 SSE·fetch 1회만 실행
let initialized = false;
let esInstance: EventSource | null = null;

export const resetBackendNotifications = () => {
  esInstance?.close();
  esInstance = null;
  initialized = false;
};

export const useBackendNotifications = () => {
  const {
    notifications,
    setNotifications,
    addNotifications,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
    remove,
  } = useBackendNotificationStore();

  useEffect(() => {
    if (initialized) return;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;

    initialized = true;

    // 초기 알림 목록 로드
    getNotificationsApi()
      .then(setNotifications)
      .catch(() => {});

    const es = new EventSource(
      `${BASE_URL}/api/notification/stream?token=${token}`,
    );
    esInstance = es;

    // 백엔드는 알림을 배열로 묶어 전송한다 (sse.service.ts)
    es.onmessage = (e: MessageEvent) => {
      try {
        const batch = JSON.parse(e.data as string) as BackendNotification[];
        if (Array.isArray(batch) && batch.length > 0) {
          addNotifications(batch);
          // 모달은 알림 리스트에서 클릭할 때만 열림 (BackendNotificationItem.handleClick)
        }
      } catch {
        // 파싱 실패 무시
      }
    };

    es.onerror = () => {
      es.close();
      esInstance = null;
      initialized = false;
    };
  }, []);

  const markAsRead = async (id: number, type: BackendNotification['type']) => {
    await markAsReadApi(id, type, true);
    storeMarkAsRead(id);
  };

  const markAllAsRead = async () => {
    await markAllAsReadApi();
    storeMarkAllAsRead();
  };

  const deleteNotification = async (
    id: number,
    type: BackendNotification['type'],
  ) => {
    await deleteNotificationApi(id, type);
    remove(id);
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    hasUnread,
  };
};
