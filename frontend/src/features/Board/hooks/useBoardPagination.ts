/**
 * @role: features — 자유게시판 서버사이드 페이지네이션·검색·정렬 훅
 * @rule: 상태·사이드이펙트만 담당, UI 로직 포함 금지
 */
import { useEffect, useRef, useState } from 'react';
import { getBoardPostsApi } from '../api/getBoardApi';
import { BoardPost, SortOrder } from '@/entities/Board/types/boardType';

const PAGE_SIZE = 8;

export const useBoardPagination = (
  searchQuery: string = '',
  sortOrder: SortOrder = 'desc',
) => {
  const ref = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BoardPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(true);

  // 검색어·정렬 변경 시 초기화
  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasMore(true);
    setIsFetching(true);
  }, [searchQuery, sortOrder]);

  // 페이지 변경 시 fetch
  useEffect(() => {
    let cancelled = false;
    setIsFetching(true);

    getBoardPostsApi({ type: 'free', page, size: PAGE_SIZE, search: searchQuery || undefined, sort: sortOrder })
      .then(({ items: newItems, pagination }) => {
        if (cancelled) return;
        setItems((prev) => (page === 1 ? newItems : [...prev, ...newItems]));
        setHasMore(page < pagination.totalPages);
        setIsFetching(false);
      })
      .catch(() => {
        if (!cancelled) setIsFetching(false);
      });

    return () => { cancelled = true; };
  }, [page, searchQuery, sortOrder]);

  const fetchMoreItems = () => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  };

  // IntersectionObserver
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchMoreItems(); },
      { threshold: 0.01, rootMargin: '200px' },
    );
    const current = ref.current;
    if (current) observer.observe(current);
    return () => { if (current) observer.unobserve(current); };
  }, [hasMore, isFetching]);

  return { ref, items, isFetching };
};
