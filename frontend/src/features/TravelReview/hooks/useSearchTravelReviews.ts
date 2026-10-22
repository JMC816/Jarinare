/**
 * @role: features — 여행지 후기 검색 (역 이름 + 게시물 내용)
 * @rule: API 호출만 담당, UI 로직 포함 금지
 */
import { useQuery } from '@tanstack/react-query';
import { getBoardPostsApi } from '@/features/Board/api/getBoardApi';

export interface SearchResultItem {
  city: string;
  reviewId: number;
  title: string;
  content: string;
  author: string;
  rating: number;
  createdAt: string;
}

export const useSearchTravelReviews = (query: string, _cities: string[]) => {
  const { data, isFetching } = useQuery({
    queryKey: ['travelReviewSearch', query],
    queryFn: () => getBoardPostsApi({ type: 'review', size: 1000 }),
    enabled: !!query.trim(),
  });

  const results: SearchResultItem[] = (() => {
    if (!query.trim() || !data) return [];
    const lower = query.trim().toLowerCase();

    return data.items
      .filter((item) => {
        const city = item.tags?.[0] ?? '';
        const cityMatches = city.toLowerCase().includes(lower);
        const contentMatches =
          item.title?.toLowerCase().includes(lower) ||
          (item.content ?? '').toLowerCase().includes(lower);
        return cityMatches || contentMatches;
      })
      .map((item) => ({
        city: item.tags?.[0] ?? '',
        reviewId: item.id,
        title: item.title,
        content: item.content ?? '',
        author: item.author,
        rating: item.rating ?? 0,
        createdAt: item.createdAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  })();

  return { results, isSearching: isFetching };
};
