/**
 * @role: features/api — 댓글 생성
 * @rule: backendClient 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';

export const createCommentApi = async (
  boardId: number,
  content: string,
  parentId: number | null,
): Promise<{ id: number }> => {
  const res = await backendClient.post<{ id: number }>('/api/comment', {
    boardId,
    content,
    parentId,
  });
  return res.data;
};
