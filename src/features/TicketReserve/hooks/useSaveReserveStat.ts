import { auth, db } from '@/shared/firebase/firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';

export const useSaveReserveStat = () => {
  const saveStat = async (destination: string) => {
    if (!auth.currentUser || !destination) return;

    const uid = auth.currentUser.uid;

    // 사용자 나이대/성별 조회
    const userSnap = await getDoc(doc(db, 'users', uid));
    const userData = userSnap.data();
    const age: string = userData?.age || '';
    const gender: string = userData?.gender || '';

    const updateData: Record<string, unknown> = {
      destination,
      totalCount: increment(1),
    };

    if (age) updateData[`age_${age}`] = increment(1);
    if (gender) updateData[`gender_${gender}`] = increment(1);

    // travelStats/{destination} 문서에 merge로 upsert
    await setDoc(doc(db, 'travelStats', destination), updateData, {
      merge: true,
    });
  };

  return { saveStat };
};
