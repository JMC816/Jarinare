import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/shared/firebase/firebase';

export const useCreateComment = (postDocId: string) => {
  const createComment = async (
    content: string,
    parentId: string | null = null,
  ) => {
    const user = auth.currentUser;
    if (!user || !content.trim()) return;

    await addDoc(collection(db, 'boardComments', postDocId, 'items'), {
      uid: user.uid,
      author: user.displayName ?? user.email ?? '익명',
      content: content.trim(),
      parentId,
      createdAt: serverTimestamp(),
    });
  };

  return { createComment };
};
