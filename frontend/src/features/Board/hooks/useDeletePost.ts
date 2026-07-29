/**
 * @role: features — 게시물 삭제 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { deletePostApi } from '../api/deletePostApi';

export const useDeletePost = () => {
  const deletePost = async (postPath: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await deletePostApi(uid, postPath);
    } catch (error) {
      console.log(error);
    }
  };

  return { deletePost };
};
