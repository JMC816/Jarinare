/**
 * @role: features/api — 이벤트 생성
 * @rule: backendClient 호출만 담당
 */
import { createBoardApi } from './createBoardApi';

export const createEventApi = async (
  title: string,
  content: string,
  imageUrl?: string,
): Promise<{ id: number }> => {
  return createBoardApi({ type: 'event', title, content, imageUrl });
};
