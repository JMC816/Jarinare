/**
 * @role: features — 여행지 후기 수정
 * @rule: API 호출만 담당, UI 로직 포함 금지
 */
import { backendClient } from '@/shared/api/backendClient';

export const useUpdateTravelReview = (_destination: string) => {
  const updateReview = async (
    reviewId: number,
    title: string,
    content: string,
    rating: number,
  ) => {
    await backendClient.put('/api/board', {
      id: reviewId,
      type: 'review',
      title,
      content,
      rating,
    });
  };

  return { updateReview };
};
