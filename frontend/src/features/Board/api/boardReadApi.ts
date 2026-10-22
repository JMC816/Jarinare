// @role: features/api
// @rule: 게시물 읽음 처리 API만 담당
import { backendClient } from '@/shared/api/backendClient';

export const markBoardReadApi = async (boardId: number): Promise<void> => {
  await backendClient.post(`/api/board/read/${boardId}`);
};

export const getReadBoardIdsApi = async (): Promise<number[]> => {
  const { data } = await backendClient.get<number[]>('/api/board/read/me');
  return data;
};
