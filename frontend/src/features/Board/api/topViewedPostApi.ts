/**
 * @role: features/Board — 인기 게시물 API
 * @rule: 백엔드 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';

export interface TopPost {
  id: number;
  title: string;
  author: string;
  views: number;
  type: string;
}

export const getTopViewedPostsApi = async (limit = 5): Promise<TopPost[]> => {
  const { data } = await backendClient.get<TopPost[]>('/api/board/top', {
    params: { limit },
  });
  return data;
};
