import { realtimeDb } from '@/shared/firebase/firebase';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { sanitizeRtdbKey } from '@/shared/lib/rtdbKey';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

export const useReadStartTime = () => {
  const { user } = useCurrentUser();
  const [readStartTime, setReadStartTime] = useState<DataSnapshot>();

  useEffect(() => {
    if (!user?.userId) return;

    const dbRef = ref(realtimeDb, `${sanitizeRtdbKey(user.userId)}_startTime`);
    // 실시간 출발 알림 조회
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        setReadStartTime(snapshot);
      } else {
        setReadStartTime(undefined);
      }
    });
  }, [user?.userId]);
  return { readStartTime };
};
