import { auth, db } from '@/shared/firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const useUpdatePoint = () => {
  const user = auth.currentUser;

  // 포인트 최신화
  const updatePoint = async (point: number) => {
    const userRef = doc(db, 'users', user!.uid);
    await updateDoc(userRef, {
      point,
    });
  };
  return { updatePoint };
};
