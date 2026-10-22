/**
 * @role: features/Board — 인기 게시물 조회 훅
 * @rule: api 호출·캐싱만 담당
 */
import { useQuery } from '@tanstack/react-query';
import { getTopViewedPostsApi } from '../api/topViewedPostApi';

export const useTopViewedPost = (limit = 5) => {
  const { data: topPosts = [] } = useQuery({
    queryKey: ['boardTop', limit],
    queryFn: () => getTopViewedPostsApi(limit),
    staleTime: 0,
  });

  return { topPosts };
};
