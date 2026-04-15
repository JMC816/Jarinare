import { db } from '@/shared/firebase/firebase';
import {
  doc,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';

export const useViewCount = (postDocId: string) => {
  const [viewCount, setViewCount] = useState(0);
  const incremented = useRef(false);

  useEffect(() => {
    if (!postDocId) return;

    const ref = doc(db, 'boardViews', postDocId);

    // StrictMode 이중 실행 방어
    if (!incremented.current) {
      incremented.current = true;
      const incrementView = async () => {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          await updateDoc(ref, { count: increment(1) });
        } else {
          await setDoc(ref, { count: 1 });
        }
      };
      incrementView();
    }

    const unsubscribe = onSnapshot(ref, (snap) => {
      setViewCount(snap.data()?.count ?? 0);
    });

    return () => unsubscribe();
  }, [postDocId]);

  return { viewCount };
};
