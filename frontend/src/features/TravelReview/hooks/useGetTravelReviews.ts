/**
 * @role: features — 특정 여행지의 후기 목록 조회
 * @rule: API 호출만 담당, UI 로직 포함 금지
 */
import { useQuery } from '@tanstack/react-query';
import { getBoardPostsApi } from '@/features/Board/api/getBoardApi';
import { toBackendImageUrl } from '@/shared/api/backendClient';
import type { TravelReview } from '@/entities/TravelReview/types/travelReviewType';

export const useGetTravelReviews = (destination: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['travelReviews', destination],
    queryFn: () => getBoardPostsApi({ type: 'review', size: 1000 }),
    enabled: !!destination,
  });

  const reviews: TravelReview[] = (data?.items ?? [])
    .filter((item) => item.tags?.[0] === destination)
    .map((item) => ({
      id: item.id,
      author: item.author,
      title: item.title,
      content: item.content ?? '',
      rating: item.rating ?? 0,
      createdAt: item.createdAt,
      imageUrl: toBackendImageUrl(item.imageUrl),
      tags: item.tags,
    }));

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return { reviews, isLoaded: !isLoading, averageRating };
};
