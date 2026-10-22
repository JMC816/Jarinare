import { backendClient } from '@/shared/api/backendClient';

export type BoardCounts = {
  free: number;
  notice: number;
  event: number;
  review: number;
};

export const getBoardCountsApi = async (): Promise<BoardCounts> => {
  const { data } = await backendClient.get<BoardCounts>('/api/board/counts');
  return data;
};
