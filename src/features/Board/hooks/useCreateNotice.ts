import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/shared/firebase/firebase';

export const useCreateNotice = () => {
  const user = auth.currentUser;
  const createNotice = async (
    author: string,
    title: string,
    content: string,
  ) => {
    const noticeCollectionRef = collection(
      db,
      'boards',
      `${user?.uid}`,
      'notice',
    );
    try {
      const docRef = await addDoc(noticeCollectionRef, {
        author,
        title,
        content,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.log(error);
    }
  };
  return { createNotice };
};
