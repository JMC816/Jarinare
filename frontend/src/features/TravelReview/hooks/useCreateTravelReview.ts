/**
 * @role: features — 여행지 후기 작성
 * @rule: API 호출만 담당, UI 로직 포함 금지
 */
import { backendClient } from '@/shared/api/backendClient';
import { uploadBoardImageApi } from '@/features/Board/api/uploadImageApi';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

export const useCreateTravelReview = (destination: string) => {
  const { user } = useCurrentUser();

  const createReview = async (
    title: string,
    content: string,
    rating: number,
    file?: File | null,
  ) => {
    if (!user) return;

    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await uploadBoardImageApi(file);
    }

    await backendClient.post('/api/board', {
      type: 'review',
      title,
      content,
      rating,
      tags: [destination],
      ...(imageUrl && { imageUrl }),
    });
  };

  return { createReview };
};
