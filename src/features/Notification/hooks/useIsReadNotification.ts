/**
 * @role: features — 승차권 관련 알림 읽음 상태 처리
 * @rule: features/Notification 내부 훅만 사용, 타 features 참조 금지
 */
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { ref, update } from 'firebase/database';
import { useChangeResponse } from './useChangeResponse';
import { useIsAcceptResponse } from './useIsAcceptResponse';
import { useReadStartTime } from './useReadStartTime';

export const useIsReadNotification = () => {
  const { response } = useChangeResponse();
  const { acceptResponse, refuseResponse } = useIsAcceptResponse();
  const { readStartTime } = useReadStartTime();
  const user = auth.currentUser;

  const updateChangeResponse = async (key: string) => {
    if (!user) return;
    await update(ref(realtimeDb, `${user.uid}_change/${key}`), {
      isRead: true,
    });
  };

  const updateAcceptResponse = async (key: string) => {
    if (!user) return;
    await update(ref(realtimeDb, `${user.uid}_accept/${key}`), {
      isRead: true,
    });
  };

  const updateRefuseResponse = async (key: string) => {
    if (!user) return;
    await update(ref(realtimeDb, `${user.uid}_refuse/${key}`), {
      isRead: true,
    });
  };

  const updateStartTimeResponse = async (key: string) => {
    if (!user) return;
    await update(ref(realtimeDb, `${user.uid}_startTime/${key}`), {
      isRead: true,
    });
  };

  const updateAllResponse = async () => {
    if (!user) return;

    if (response?.exists) {
      await Promise.all(
        Object.keys(response.val()).map((key) =>
          update(ref(realtimeDb, `${user.uid}_change/${key}`), {
            isRead: true,
          }),
        ),
      );
    }
    if (acceptResponse?.exists()) {
      await Promise.all(
        Object.keys(acceptResponse.val()).map((key) =>
          update(ref(realtimeDb, `${user.uid}_accept/${key}`), {
            isRead: true,
          }),
        ),
      );
    }
    if (refuseResponse?.exists()) {
      await Promise.all(
        Object.keys(refuseResponse.val()).map((key) =>
          update(ref(realtimeDb, `${user.uid}_refuse/${key}`), {
            isRead: true,
          }),
        ),
      );
    }
    if (readStartTime?.exists()) {
      await Promise.all(
        Object.keys(readStartTime.val()).map((key) =>
          update(ref(realtimeDb, `${user.uid}_startTime/${key}`), {
            isRead: true,
          }),
        ),
      );
    }
  };

  return {
    updateChangeResponse,
    updateAcceptResponse,
    updateRefuseResponse,
    updateStartTimeResponse,
    updateAllResponse,
  };
};
