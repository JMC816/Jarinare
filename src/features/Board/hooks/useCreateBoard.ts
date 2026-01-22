import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/shared/firebase/firebase';

export const useCreateBoard = () => {
  const user = auth.currentUser;
  const createBoard = async (
    author: string,
    title: string,
    content: string,
  ) => {
    const boardCollectionRef = collection(
      db,
      'boards',
      `${user?.uid}`,
      'board',
    );
    try {
      const docRef = await addDoc(boardCollectionRef, {
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
  return { createBoard };
};
