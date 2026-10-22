/**
 * @role: pages — PCBoardPage 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useMemo, useState } from 'react';
import { useGetBoard } from '@/features/Board/hooks/useGetBoard';
import { useGetNotice } from '@/features/Board/hooks/useGetNotice';
import { useGetEvent } from '@/features/Board/hooks/useGetEvent';
import { BoardFilter, SearchResultPost } from '../types/boardPageType';

export type { BoardFilter };

export const usePCBoardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<BoardFilter>('전체');
  const [currentPage, setCurrentPage] = useState(0);
  const { boardData, isLoaded: boardLoaded } = useGetBoard();
  const { noticeData, isLoaded: noticeLoaded } = useGetNotice();
  const { eventData, isLoaded: eventLoaded } = useGetEvent();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchQuery(searchQuery.trim());
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearchQuery('');
    setCurrentPage(0);
  };

  const handleFilterChange = (filter: BoardFilter) => {
    setActiveFilter(filter);
    setCurrentPage(0);
  };

  // 전체 게시물: 모든 카테고리 합산, 최신순 정렬
  const allPosts = useMemo((): SearchResultPost[] => {
    return [
      ...boardData.map((p) => ({ ...p, _category: 'board' as const })),
      ...noticeData.map((p) => ({ ...p, _category: 'notice' as const })),
      ...eventData.map((p) => ({ ...p, _category: 'event' as const })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [boardData, noticeData, eventData]);

  // 필터 적용된 게시물
  const displayPosts = useMemo((): SearchResultPost[] => {
    if (activeFilter === '전체') return allPosts;
    if (activeFilter === '공지')
      return allPosts.filter((p) => p._category === 'notice');
    if (activeFilter === '이벤트')
      return allPosts.filter((p) => p._category === 'event');
    if (activeFilter === '자유')
      return allPosts.filter((p) => p._category === 'board');
    return [];
  }, [allPosts, activeFilter]);

  // 검색어 + 필터 동시 적용
  const searchResults = useMemo((): SearchResultPost[] => {
    const q = activeSearchQuery.toLowerCase();
    if (!q) return [];
    return displayPosts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q),
    );
  }, [activeSearchQuery, displayPosts]);

  const pageSize = 8;

  const pagedPosts = displayPosts.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );
  const totalPages = Math.ceil(displayPosts.length / pageSize);
  const showPagination = !activeSearchQuery && displayPosts.length > pageSize;

  // 현재 페이지 기준 최대 5개 페이지 번호
  const visiblePages = (() => {
    const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
    const end = Math.min(totalPages, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  })();

  const formatDate = (createdAt: string | number) => {
    const d =
      typeof createdAt === 'number'
        ? new Date(createdAt * 1000)
        : new Date(createdAt);
    return d
      .toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
      .replace('. ', '/')
      .replace('.', '');
  };

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleClearSearch,
    activeSearchQuery,
    searchResults,
    activeFilter,
    setActiveFilter: handleFilterChange,
    formatDate,
    displayPosts,
    currentPage,
    setCurrentPage,
    isLoading: !boardLoaded || !noticeLoaded || !eventLoaded,
    pagedPosts,
    totalPages,
    showPagination,
    visiblePages,
  };
};
