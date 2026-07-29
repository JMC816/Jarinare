import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

export const useReadStartTime = () => {
  const user = auth.currentUser;
  const [readStartTime, setReadStartTime] = useState<DataSnapshot>();

  useEffect(() => {
    if (!user) return;

    const dbRef = ref(realtimeDb, `${user?.uid}_startTime`);
    // 실시간 출발 알림 조회
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        setReadStartTime(snapshot);
      } else {
        setReadStartTime(undefined);
      }
    });
  }, [user]);
  return { readStartTime };
};
