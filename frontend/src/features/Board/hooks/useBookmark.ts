/**
 * @role: features — 게시물 즐겨찾기 토글·상태 관리
 * @rule: API 호출·상태만 담당, UI 로직 포함 금지
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toggleBookmarkApi, getBookmarkIdsApi } from '../api/bookmarkApi';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

export const useBookmark = (boardId?: number) => {
  const { isLoggedIn } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: bookmarkIds = [] } = useQuery({
    queryKey: ['bookmarkIds'],
    queryFn: getBookmarkIdsApi,
    enabled: isLoggedIn,
    staleTime: 60_000,
  });

  const isBookmarked = boardId !== undefined ? bookmarkIds.includes(boardId) : false;

  const toggleBookmark = async (id: number) => {
    if (!isLoggedIn) return;
    // optimistic update — 클릭 즉시 색 반영
    const prev = queryClient.getQueryData<number[]>(['bookmarkIds']) ?? [];
    const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
    queryClient.setQueryData(['bookmarkIds'], next);

    try {
      await toggleBookmarkApi(id);
      queryClient.invalidateQueries({ queryKey: ['bookmarkedPosts'] });
    } catch {
      // 실패 시 롤백
      queryClient.setQueryData(['bookmarkIds'], prev);
    }
  };

  return { isBookmarked, toggleBookmark, bookmarkIds };
};
