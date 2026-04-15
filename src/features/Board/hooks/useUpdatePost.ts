import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/shared/firebase/firebase';

export const useUpdatePost = () => {
  const updatePost = async (
    postPath: string,
    data: { title: string; content: string },
  ) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const parts = postPath.split('/');
    if (parts[1] !== uid) return;
    try {
      await updateDoc(doc(db, parts[0], parts[1], parts[2], parts[3]), data);
    } catch (error) {
      console.log(error);
    }
  };
  return { updatePost };
};
