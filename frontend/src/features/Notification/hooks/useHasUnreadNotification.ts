/**
 * @role: features — 미읽은 알림 존재 여부 감지
 * @rule: Realtime DB 구독만 담당, UI 포함 금지
 */
import { realtimeDb } from '@/shared/firebase/firebase';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { sanitizeRtdbKey } from '@/shared/lib/rtdbKey';
import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

export const useHasUnreadNotification = () => {
  const [hasUnread, setHasUnread] = useState(false);
  const { user } = useCurrentUser();

  useEffect(() => {
    if (!user?.userId) return;

    const path = `${sanitizeRtdbKey(user.userId)}_startTime`;
    const unsub = onValue(ref(realtimeDb, path), (snap) => {
      if (!snap.exists()) {
        setHasUnread(false);
      } else {
        const entries = Object.values(
          snap.val() as Record<string, { isRead: boolean }>,
        );
        setHasUnread(entries.some((e) => e.isRead === false));
      }
    });

    return () => unsub();
  }, [user?.userId]);

  return { hasUnread };
};
