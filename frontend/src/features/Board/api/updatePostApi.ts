/**
 * @role: features/api — 게시물 수정
 * @rule: backendClient 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';
import { BoardType } from '@/entities/Board/types/boardType';

export interface UpdatePostParams {
  type: BoardType;
  title?: string;
  content?: string;
  imageUrl?: string | null;
  tags?: string[];
  rating?: number;
}

export const updatePostApi = async (
  id: number,
  params: UpdatePostParams,
): Promise<{ message: string }> => {
  const res = await backendClient.put<{ message: string }>('/api/board', { id, ...params });
  return res.data;
};
