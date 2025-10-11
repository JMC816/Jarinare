import { auth, db } from '@/shared/firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const useIsNotification = () => {
  const user = auth.currentUser;

  const updateIsChange = async (change: boolean) => {
    if (!user) {
      console.warn('사용자가 로그인되어 있지 않습니다.');
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      change,
    });
  };

  const updateIsResponse = async (response: boolean) => {
    if (!user) {
      console.warn('사용자가 로그인되어 있지 않습니다.');
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      response,
    });
  };

  return { updateIsChange, updateIsResponse };
};
