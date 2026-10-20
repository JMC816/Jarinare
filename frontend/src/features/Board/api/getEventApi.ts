/**
 * @role: features/api — 이벤트 목록 조회
 * @rule: backendClient 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';
import { BoardListResponse } from '@/entities/Board/types/boardType';
import type { BoardListParams } from './getBoardApi';

export const getEventPostsApi = async (
  params?: Omit<BoardListParams, 'type'>,
): Promise<BoardListResponse> => {
  const res = await backendClient.get<BoardListResponse>('/api/board', {
    params: { type: 'event', ...params },
  });
  return res.data;
};
