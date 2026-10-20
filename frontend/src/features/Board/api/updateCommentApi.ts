/**
 * @role: features/api — 댓글 수정
 * @rule: backendClient 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';

export const updateCommentApi = async (
  id: number,
  boardId: number,
  content: string,
  parentId: number | null,
): Promise<{ message: string }> => {
  const res = await backendClient.put<{ message: string }>('/api/comment', {
    id,
    boardId,
    content,
    parentId,
  });
  return res.data;
};
