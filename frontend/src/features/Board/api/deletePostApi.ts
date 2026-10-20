/**
 * @role: features/api — 게시물 삭제
 * @rule: backendClient 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';
import { BoardType } from '@/entities/Board/types/boardType';

export const deletePostApi = async (
  id: number,
  type: BoardType,
): Promise<{ message: string }> => {
  const res = await backendClient.delete<{ message: string }>('/api/board', {
    data: { id, type },
  });
  return res.data;
};
