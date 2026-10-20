/**
 * @role: features — 이벤트 목록 조회 훅
 * @rule: api/ 호출만 담당
 */
import { useEffect, useState } from 'react';
import { getEventPostsApi } from '../api/getEventApi';
import { BoardPost, BoardPagination } from '@/entities/Board/types/boardType';

export const useGetEvent = (params?: { page?: number; size?: number; search?: string; sort?: 'asc' | 'desc' }) => {
  const [eventData, setEventData] = useState<BoardPost[]>([]);
  const [pagination, setPagination] = useState<BoardPagination | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    getEventPostsApi(params)
      .then(({ items, pagination: pg }) => {
        setEventData(items);
        setPagination(pg);
      })
      .catch((e) => console.error('[useGetEvent]', e))
      .finally(() => setIsLoaded(true));
  }, [params?.page, params?.size, params?.search, params?.sort]);

  return { eventData, pagination, isLoaded };
};
