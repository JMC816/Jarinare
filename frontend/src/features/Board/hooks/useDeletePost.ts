/**
 * @role: features — 게시물 삭제 훅
 * @rule: api/ 호출만 담당
 */
import { deletePostApi } from '../api/deletePostApi';
import { BoardType } from '@/entities/Board/types/boardType';

export const useDeletePost = () => {
  const deletePost = async (id: number, type: BoardType): Promise<boolean> => {
    try {
      await deletePostApi(id, type);
      return true;
    } catch (error) {
      console.error('[useDeletePost]', error);
      return false;
    }
  };
  return { deletePost };
};
