/**
 * @role: features — 공지사항 목록 조회 훅
 * @rule: api/ 호출만 담당
 */
import { useEffect, useState } from 'react';
import { getNoticePostsApi } from '../api/getNoticeApi';
import { BoardPost, BoardPagination } from '@/entities/Board/types/boardType';

export const useGetNotice = (params?: { page?: number; size?: number; search?: string; sort?: 'asc' | 'desc' }) => {
  const [noticeData, setNoticeData] = useState<BoardPost[]>([]);
  const [pagination, setPagination] = useState<BoardPagination | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    getNoticePostsApi(params)
      .then(({ items, pagination: pg }) => {
        setNoticeData(items);
        setPagination(pg);
      })
      .catch((e) => console.error('[useGetNotice]', e))
      .finally(() => setIsLoaded(true));
  }, [params?.page, params?.size, params?.search, params?.sort]);

  return { noticeData, pagination, isLoaded };
};
