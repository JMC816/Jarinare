import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

export const useChangeResponse = () => {
  const [response, setResponse] = useState<DataSnapshot>();

  const user = auth.currentUser;

  useEffect(() => {
    // 좌석 변경 요청 응답
    const changeResponse = () => {
      const dbRef = ref(realtimeDb, `${user?.uid}_change`);
      // 실시간으로 알림 전송
      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          setResponse(snapshot);
        } else {
          setResponse(undefined);
        }
      });
    };
    changeResponse();
  }, []);

  return { response, setResponse };
};
