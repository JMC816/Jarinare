/**
 * @role: features/api — 댓글 소프트 삭제
 * @rule: backendClient 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';

export const deleteCommentApi = async (
  id: number,
  parentId: number | null,
): Promise<{ message: string }> => {
  const res = await backendClient.delete<{ message: string }>('/api/comment', {
    data: { id, parentId },
  });
  return res.data;
};
