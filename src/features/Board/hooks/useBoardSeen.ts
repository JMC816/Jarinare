import { auth, db } from '@/shared/firebase/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

type Category = 'notice' | 'event' | 'board';

interface SeenData {
  notice: number;
  event: number;
  board: number;
}

export const useBoardSeen = () => {
  const [seenData, setSeenData] = useState<SeenData>({ notice: 0, event: 0, board: 0 });

  useEffect(() => {
    const load = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const ref = doc(db, 'boardSeen', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSeenData(snap.data() as SeenData);
      }
    };
    load();
  }, []);

  const markSeen = async (category: Category) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const now = Math.floor(Date.now() / 1000);
    const ref = doc(db, 'boardSeen', uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      await updateDoc(ref, { [category]: now });
    } else {
      await setDoc(ref, { notice: 0, event: 0, board: 0, [category]: now });
    }

    setSeenData((prev) => ({ ...prev, [category]: now }));
  };

  return { seenData, markSeen };
};
