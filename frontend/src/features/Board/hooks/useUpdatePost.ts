/**
 * @role: features — 게시물 수정 훅
 * @rule: api/ 호출만 담당
 */
import { updatePostApi, UpdatePostParams } from '../api/updatePostApi';

export const useUpdatePost = () => {
  const updatePost = async (id: number, params: UpdatePostParams): Promise<boolean> => {
    try {
      await updatePostApi(id, params);
      return true;
    } catch (error) {
      console.error('[useUpdatePost]', error);
      return false;
    }
  };
  return { updatePost };
};
