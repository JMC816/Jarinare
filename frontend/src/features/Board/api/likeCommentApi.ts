/**
 * @role: features/api — 댓글 좋아요 토글·조회
 * @rule: 백엔드 API 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';

export const toggleCommentLikeApi = async (
  commentId: number,
): Promise<{ liked: number; isLiked: boolean }> => {
  const res = await backendClient.post('/api/comment/like', { commentId });
  return res.data;
};

export const getLikedCommentIdsApi = async (
  boardId: number,
): Promise<number[]> => {
  const res = await backendClient.get('/api/comment/like/me', {
    params: { boardId },
  });
  return res.data;
};
