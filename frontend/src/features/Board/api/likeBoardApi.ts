/**
 * @role: features/api — 게시물 좋아요 토글·조회
 * @rule: 백엔드 API 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';

export const toggleBoardLikeApi = async (
  boardId: number,
): Promise<{ liked: number; isLiked: boolean }> => {
  const res = await backendClient.post('/api/board/like', { boardId });
  return res.data;
};

export const getLikedBoardIdsApi = async (): Promise<number[]> => {
  const res = await backendClient.get('/api/board/like/me');
  return res.data;
};
