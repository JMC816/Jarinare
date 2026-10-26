/**
 * @role: features/api — 게시물 즐겨찾기 토글·조회
 * @rule: 백엔드 API 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';
import { BoardPost } from '@/entities/Board/types/boardType';

export const toggleBookmarkApi = async (
  boardId: number,
): Promise<{ bookmarked: boolean }> => {
  const res = await backendClient.post('/api/board/bookmarks', { boardId });
  return res.data;
};

export const getBookmarkIdsApi = async (): Promise<number[]> => {
  const res = await backendClient.get('/api/board/bookmarks/me');
  return res.data;
};

export const getBookmarkedPostsApi = async (): Promise<BoardPost[]> => {
  const res = await backendClient.get('/api/board/bookmarks/posts');
  return res.data;
};
