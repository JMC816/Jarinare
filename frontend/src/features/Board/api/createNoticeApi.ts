/**
 * @role: features/api — 공지사항 생성
 * @rule: backendClient 호출만 담당
 */
import { createBoardApi } from './createBoardApi';

export const createNoticeApi = async (
  title: string,
  content: string,
  imageUrl?: string,
): Promise<{ id: number }> => {
  return createBoardApi({ type: 'notice', title, content, imageUrl });
};
