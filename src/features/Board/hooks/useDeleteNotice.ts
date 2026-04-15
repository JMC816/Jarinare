import { deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/shared/firebase/firebase';

export const useDeleteNotice = () => {
  const user = auth.currentUser;

  const deleteNotice = async (noticeId: string) => {
    try {
      await deleteDoc(doc(db, 'boards', `${user?.uid}`, 'notice', noticeId));
    } catch (error) {
      console.log(error);
    }
  };
  return { deleteNotice };
};
