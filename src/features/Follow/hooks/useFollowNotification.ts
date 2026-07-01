/**
 * @role: features — 팔로우 알림 실시간 구독
 * @rule: Realtime DB 리스너만 담당, UI 포함 금지
 */
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

export const useFollowNotification = () => {
  const [followNotifications, setFollowNotifications] = useState<
    DataSnapshot | undefined
  >();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const dbRef = ref(realtimeDb, `${user.uid}_follow`);
    const unsub = onValue(dbRef, (snapshot) => {
      setFollowNotifications(snapshot.exists() ? snapshot : undefined);
    });
    return () => unsub();
  }, [user?.uid]);

  return { followNotifications };
};
