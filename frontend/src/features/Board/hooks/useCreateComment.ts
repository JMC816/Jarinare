/**
 * @role: features — 댓글 생성 훅
 * @rule: api/ 호출만 담당
 */
import { createCommentApi } from '../api/createCommentApi';

export const useCreateComment = (boardId: number) => {
  const createComment = async (
    content: string,
    parentId: number | null = null,
  ) => {
    if (!content.trim()) return;
    await createCommentApi(boardId, content, parentId);
  };

  return { createComment };
};
