/**
 * @role: features — 출발 알림 읽음 상태 처리 (startTime만 담당)
 * @rule: features/Notification 내부 훅만 사용, 타 features 참조 금지
 */
import { realtimeDb } from '@/shared/firebase/firebase';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { sanitizeRtdbKey } from '@/shared/lib/rtdbKey';
import { ref, update } from 'firebase/database';
import { useReadStartTime } from './useReadStartTime';

export const useIsReadNotification = () => {
  const { readStartTime } = useReadStartTime();
  const { user } = useCurrentUser();

  const updateStartTimeResponse = async (key: string) => {
    if (!user?.userId) return;
    await update(ref(realtimeDb, `${sanitizeRtdbKey(user.userId)}_startTime/${key}`), {
      isRead: true,
    });
  };

  const updateAllResponse = async () => {
    if (!user?.userId || !readStartTime?.exists()) return;
    await Promise.all(
      Object.keys(readStartTime.val()).map((key) =>
        update(ref(realtimeDb, `${sanitizeRtdbKey(user.userId!)}_startTime/${key}`), {
          isRead: true,
        }),
      ),
    );
  };

  return {
    updateStartTimeResponse,
    updateAllResponse,
  };
};
