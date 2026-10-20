/**
 * @role: features — 자유게시판 목록 조회 훅
 * @rule: api/ 호출만 담당
 */
import { useEffect, useState } from 'react';
import { getBoardPostsApi, BoardListParams } from '../api/getBoardApi';
import { BoardPost, BoardPagination } from '@/entities/Board/types/boardType';

export const useGetBoard = (params?: Omit<BoardListParams, 'type'>) => {
  const [boardData, setBoarData] = useState<BoardPost[]>([]);
  const [pagination, setPagination] = useState<BoardPagination | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    getBoardPostsApi({ type: 'free', ...params })
      .then(({ items, pagination: pg }) => {
        setBoarData(items);
        setPagination(pg);
      })
      .catch((e) => console.error('[useGetBoard]', e))
      .finally(() => setIsLoaded(true));
  }, [params?.page, params?.size, params?.search, params?.sort]);

  return { boardData, pagination, isLoaded };
};
