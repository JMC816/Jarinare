import { auth, db } from '@/shared/firebase/firebase';
import {
  doc,
  DocumentData,
  DocumentSnapshot,
  onSnapshot,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useIsNotificationResponse = () => {
  const [isNotification, setIsNotification] =
    useState<DocumentSnapshot<DocumentData, DocumentData>>();
  const user = auth.currentUser;

  // 실시간 알림 활성화 유무
  useEffect(() => {
    const isToggle = () => {
      const userDoc = doc(db, 'users', user!.uid);
      const unsub = onSnapshot(userDoc, (docSnap) => {
        if (docSnap.exists()) {
          setIsNotification(docSnap);
        }
      });
      return () => unsub();
    };
    isToggle();
  }, []);

  return { isNotification };
};
