/**
 * @role: features — 카테고리별 게시물 수 조회
 * @rule: 데이터 조회만 담당, UI 포함 금지
 */
import { useQuery } from '@tanstack/react-query';
import { getBoardCountsApi } from '../api/boardCountsApi';

export const useBoardCounts = () => {
  const { data } = useQuery({
    queryKey: ['boardCounts'],
    queryFn: getBoardCountsApi,
  });

  return {
    counts: data ?? { free: 0, notice: 0, event: 0, review: 0 },
  };
};
