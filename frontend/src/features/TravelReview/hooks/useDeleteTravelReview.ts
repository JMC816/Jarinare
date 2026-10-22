/**
 * @role: features — 여행지 후기 삭제
 * @rule: API 호출만 담당, UI 로직 포함 금지
 */
import { backendClient } from '@/shared/api/backendClient';

export const useDeleteTravelReview = (_destination: string) => {
  const deleteReview = async (reviewId: number) => {
    await backendClient.delete('/api/board', {
      data: { id: reviewId, type: 'review' },
    });
  };

  return { deleteReview };
};
