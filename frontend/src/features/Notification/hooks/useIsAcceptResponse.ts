import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

export const useIsAcceptResponse = () => {
  const [refuseResponse, setRefuseResponse] = useState<DataSnapshot>();
  const [acceptResponse, setaccpetResponse] = useState<DataSnapshot>();

  const user = auth.currentUser;

  useEffect(() => {
    // 수락 응답
    const refuseResponse = () => {
      const dbRef = ref(realtimeDb, `${user?.uid}_refuse`);
      // 실시간으로 알림 전송
      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          setRefuseResponse(snapshot);
        } else {
          setRefuseResponse(undefined);
        }
      });
    };
    refuseResponse();
  }, []);

  useEffect(() => {
    // 거절 응답
    const acceptResponse = () => {
      const dbRef = ref(realtimeDb, `${user?.uid}_accept`);
      // 실시간으로 알림 전송
      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          setaccpetResponse(snapshot);
        } else {
          setaccpetResponse(undefined);
        }
      });
    };
    acceptResponse();
  }, []);

  return { refuseResponse, acceptResponse };
};
