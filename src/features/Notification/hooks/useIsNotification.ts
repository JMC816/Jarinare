import { auth, db } from '@/shared/firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const useIsNotification = () => {
  const user = auth.currentUser;
  const updateIsChange = async (change: boolean) => {
    const userRef = doc(db, 'users', user!.uid);
    await updateDoc(userRef, {
      change,
    });
  };
  const updateIsResponse = async (response: boolean) => {
    const userRef = doc(db, 'users', user!.uid);
    await updateDoc(userRef, {
      response,
    });
  };

  return { updateIsChange, updateIsResponse };
};
