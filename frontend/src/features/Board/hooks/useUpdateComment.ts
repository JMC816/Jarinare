/**
 * @role: features — 댓글 수정 훅
 * @rule: api/ 호출만 담당
 */
import { updateCommentApi } from '../api/updateCommentApi';

export const useUpdateComment = (boardId: number) => {
  const updateComment = async (
    id: number,
    content: string,
    parentId: number | null,
  ) => {
    if (!content.trim()) return;
    await updateCommentApi(id, boardId, content, parentId);
  };

  return { updateComment };
};
