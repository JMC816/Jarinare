/**
 * @role: features — 전체 역의 평균 별점 조회 (Ticker 정렬용)
 * @rule: API 호출만 담당, UI 로직 포함 금지
 */
import { useQuery } from '@tanstack/react-query';
import { getBoardPostsApi } from '@/features/Board/api/getBoardApi';
import type { DestinationReviewSummary } from '@/entities/TravelReview/types/travelReviewType';

export const useDestinationRatings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['destinationRatings'],
    queryFn: () => getBoardPostsApi({ type: 'review', size: 1000 }),
  });

  const summaries: DestinationReviewSummary[] = (() => {
    if (!data) return [];

    const cityMap = new Map<string, { totalRating: number; count: number }>();

    for (const item of data.items) {
      const city = item.tags?.[0];
      if (!city) continue;
      const existing = cityMap.get(city) ?? { totalRating: 0, count: 0 };
      cityMap.set(city, {
        totalRating: existing.totalRating + (item.rating ?? 0),
        count: existing.count + 1,
      });
    }

    const result: DestinationReviewSummary[] = Array.from(cityMap.entries()).map(
      ([city, { totalRating, count }]) => ({
        city,
        averageRating: count > 0 ? totalRating / count : 0,
        reviewCount: count,
      }),
    );

    result.sort((a, b) => {
      if (b.averageRating !== a.averageRating)
        return b.averageRating - a.averageRating;
      return a.city.localeCompare(b.city, 'ko');
    });

    return result;
  })();

  return { summaries, isLoaded: !isLoading };
};
