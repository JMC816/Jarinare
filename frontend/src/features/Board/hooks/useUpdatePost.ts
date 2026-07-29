/**
 * @role: features — 게시물 수정 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { updatePostApi } from '../api/updatePostApi';

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
      await updatePostApi(postPath, data);
    } catch (error) {
      console.log(error);
    }
  };
  return { updatePost };
};
