/**
 * @role: features — 댓글 삭제 훅
 * @rule: api/ 호출만 담당
 */
import { deleteCommentApi } from '../api/deleteCommentApi';

export const useDeleteComment = () => {
  const deleteComment = async (id: number, parentId: number | null) => {
    await deleteCommentApi(id, parentId);
  };

  return { deleteComment };
};
