/**
 * @role: features/api — 게시물 생성
 * @rule: backendClient 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';
import { BoardType } from '@/entities/Board/types/boardType';

export interface CreateBoardParams {
  type: BoardType;
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  rating?: number;
}

export const createBoardApi = async (
  params: CreateBoardParams,
): Promise<{ id: number }> => {
  const res = await backendClient.post<{ id: number }>('/api/board', params);
  return res.data;
};
