/**
 * @role: features — 팔로우 최다 보유자 게시글 알림 구독
 * @rule: Realtime DB 리스너만 담당, UI 포함 금지
 */
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

export const useTopFollowerNotification = () => {
  const [topFollowerNotifications, setTopFollowerNotifications] = useState<
    DataSnapshot | undefined
  >();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const dbRef = ref(realtimeDb, `${user.uid}_topFollower`);
    const unsub = onValue(dbRef, (snapshot) => {
      setTopFollowerNotifications(snapshot.exists() ? snapshot : undefined);
    });
    return () => unsub();
  }, [user?.uid]);

  return { topFollowerNotifications };
};
