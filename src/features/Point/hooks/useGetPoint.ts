import { auth, db } from '@/shared/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useGetPoint = () => {
  const [point, setPoint] = useState<number>(0);
  const user = auth.currentUser;

  // 각 사용자의 포인트
  useEffect(() => {
    const getPoint = async () => {
      const userRef = doc(db, 'users', user!.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setPoint(userSnap.data().point);
      }
    };
    getPoint();
  }, []);
  return { point };
};
