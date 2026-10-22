/**
 * @role: features/api — 게시물 댓글 조회
 * @rule: backendClient 호출만 담당
 */
import { Comment } from '@/entities/Board/types/commentType';
import { backendClient } from '@/shared/api/backendClient';

export const getCommentsApi = async (boardId: number): Promise<Comment[]> => {
  const { data } = await backendClient.get<Comment[]>('/api/comment', {
    params: { boardId },
  });
  return data;
};
