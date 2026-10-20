/**
 * @role: features/api — 백엔드 알림 조회·읽음·삭제 처리
 * @rule: 백엔드 API 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';
import type {
  BackendNotification,
  BackendNotificationType,
} from '@/widgets/Notification/types/backendNotificationType';

export const getNotificationsApi = async (): Promise<BackendNotification[]> => {
  // validateStatus로 401을 정상 응답으로 받아 인터셉터 retry/redirect 우회
  const res = await backendClient.get('/api/notification', {
    validateStatus: (status) => status === 200 || status === 401,
  });
  if (res.status === 401) return [];
  return res.data;
};

export const markAsReadApi = async (
  id: number,
  type: BackendNotificationType,
  isRead: boolean = true,
): Promise<void> => {
  await backendClient.put('/api/notification', { id, type, isRead });
};

export const markAllAsReadApi = async (): Promise<void> => {
  await backendClient.patch('/api/notification/read-all');
};

export const deleteNotificationApi = async (
  id: number,
  type: BackendNotificationType,
): Promise<void> => {
  await backendClient.delete('/api/notification', { data: { id, type } });
};
