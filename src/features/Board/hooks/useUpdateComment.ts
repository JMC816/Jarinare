import { auth, db } from '@/shared/firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const useUpdateComment = (postDocId: string) => {
  const updateComment = async (commentId: string, content: string) => {
    const user = auth.currentUser;
    if (!user || !content.trim()) return;
    await updateDoc(doc(db, 'boardComments', postDocId, 'items', commentId), {
      content: content.trim(),
    });
  };

  return { updateComment };
};
