import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetBoard } from './useGetBoard';
import { BoardPost } from '@/entities/Board/types/boardType';

type SortOrder = 'newest' | 'oldest' | 'views' | 'likes';

export const useBoardPagination = (
  searchQuery: string = '',
  sortOrder: SortOrder = 'newest',
) => {
  const ref = useRef<HTMLDivElement>(null);
  const { boardData, isLoaded } = useGetBoard();

  const [boardPage, setBoardPage] = useState(0);
  const [items, setItems] = useState<BoardPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(true);

  const PAGE_SIZE = 8;

  const filteredData = useMemo(() => {
    let data = boardData;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      data = data.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.content?.toLowerCase().includes(q) ||
          d.author?.toLowerCase().includes(q),
      );
    }

    return [...data].sort((a, b) =>
      sortOrder === 'newest'
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt,
    );
  }, [boardData, searchQuery, sortOrder]);

  useEffect(() => {
    if (!isLoaded) return;

    if (filteredData.length === 0) {
      setItems([]);
      setHasMore(false);
      setIsFetching(false);
      return;
    }

    const firstPage = filteredData.slice(0, PAGE_SIZE);
    const nextPage = filteredData.slice(PAGE_SIZE, PAGE_SIZE * 2);

    setItems(firstPage);
    setBoardPage(0);
    setHasMore(nextPage.length > 0);
    setIsFetching(false);
  }, [filteredData, isLoaded]);

  const fetchMoreItems = () => {
    const nextPage = boardPage + 1;
    const nextItems = filteredData.slice(
      nextPage * PAGE_SIZE,
      (nextPage + 1) * PAGE_SIZE,
    );

    if (nextItems.length === 0) {
      setHasMore(false);
      return;
    }

    setItems((prev) => [...prev, ...nextItems]);
    setBoardPage(nextPage);

    if ((nextPage + 1) * PAGE_SIZE >= filteredData.length) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreItems();
        }
      },
      { threshold: 0.01, rootMargin: '200px' },
    );

    const current = ref.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, boardPage, filteredData]);

  return { ref, items, isFetching };
};
