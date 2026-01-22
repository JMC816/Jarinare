import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/shared/firebase/firebase';

export const useCreateEvent = () => {
  const user = auth.currentUser;
  const createEvent = async (
    author: string,
    title: string,
    content: string,
  ) => {
    const eventCollectionRef = collection(
      db,
      'boards',
      `${user?.uid}`,
      'event',
    );
    try {
      const docRef = await addDoc(eventCollectionRef, {
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
  return { createEvent };
};
