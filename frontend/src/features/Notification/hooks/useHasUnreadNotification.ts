/**
 * @role: features — 미읽은 알림 존재 여부 감지
 * @rule: Realtime DB 구독만 담당, UI 포함 금지
 */
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

const PATHS = [
  '_change',
  '_accept',
  '_refuse',
  '_startTime',
  '_follow',
  '_topFollower',
  '_followPost',
] as const;

export const useHasUnreadNotification = () => {
  const [hasUnread, setHasUnread] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const unreadPerPath: Record<string, boolean> = {};

    const unsubs = PATHS.map((suffix) => {
      const path = `${user.uid}${suffix}`;
      return onValue(ref(realtimeDb, path), (snap) => {
        if (!snap.exists()) {
          unreadPerPath[suffix] = false;
        } else {
          const entries = Object.values(
            snap.val() as Record<string, { isRead: boolean }>,
          );
          unreadPerPath[suffix] = entries.some((e) => e.isRead === false);
        }
        setHasUnread(Object.values(unreadPerPath).some(Boolean));
      });
    });

    return () => unsubs.forEach((u) => u());
  }, [user?.uid]);

  return { hasUnread };
};
