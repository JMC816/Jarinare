/**
 * @role: pages — PCBoardPage 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import { useBoardSeen } from '@/features/Board/hooks/useBoardSeen';
import { useDestinationRatings } from '@/features/TravelReview/hooks/useDestinationRatings';
import { useGetBoard } from '@/features/Board/hooks/useGetBoard';
import { useGetNotice } from '@/features/Board/hooks/useGetNotice';
import { useGetDvent } from '@/features/Board/hooks/useGetEvent';
import { useTopViewedPost } from '@/features/Board/hooks/useTopViewedPost';
import {
  BOARD_CARD_HEADER_H,
  BOARD_ROW_H,
  BOARD_PAGINATION_H,
} from '../constants/boardPageConstants';
import { BoardFilter, SearchResultPost } from '../types/boardPageType';

export type { BoardFilter };

export const usePCBoardPage = (
  rightColRef: RefObject<HTMLDivElement | null>,
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<BoardFilter>('전체');
  const [currentPage, setCurrentPage] = useState(0);
  const [rightColH, setRightColH] = useState(0);
  const { seenData } = useBoardSeen();
  const { summaries } = useDestinationRatings();
  const { boardData, isLoaded } = useGetBoard();
  const { noticeData } = useGetNotice();
  const { eventDat } = useGetDvent();
  const { topPosts } = useTopViewedPost();

  // 오른쪽 컬럼 높이 측정
  useEffect(() => {
    const el = rightColRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setRightColH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [rightColRef]);

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

  // 실시간 인기 상위 3개 docId Set
  const top3DocIds = useMemo(
    () => new Set(topPosts.slice(0, 3).map((p) => p.id.split('/').pop())),
    [topPosts],
  );

  // 전체 게시물: 모든 카테고리 합산, 최신순 정렬
  const allPosts = useMemo((): SearchResultPost[] => {
    return [
      ...boardData.map((p) => ({ ...p, _category: 'board' as const })),
      ...noticeData.map((p) => ({ ...p, _category: 'notice' as const })),
      ...eventDat.map((p) => ({ ...p, _category: 'event' as const })),
    ].sort((a, b) => b.createdAt - a.createdAt);
  }, [boardData, noticeData, eventDat]);

  // 필터 적용된 게시물
  const displayPosts = useMemo((): SearchResultPost[] => {
    if (activeFilter === '전체') return allPosts;
    if (activeFilter === '공지')
      return allPosts.filter((p) => p._category === 'notice');
    if (activeFilter === '자유')
      return allPosts.filter((p) => p._category === 'board');
    return [];
  }, [allPosts, activeFilter]);

  // 검색어가 있을 때 전체 게시물 필터링
  const searchResults = useMemo((): SearchResultPost[] => {
    const q = activeSearchQuery.toLowerCase();
    if (!q) return [];
    return allPosts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q),
    );
  }, [activeSearchQuery, allPosts]);

  // 오른쪽 컬럼 높이 기반 페이지당 게시물 수
  const pageSize =
    rightColH > 0
      ? Math.max(
          1,
          Math.floor(
            (rightColH - BOARD_CARD_HEADER_H - BOARD_PAGINATION_H) /
              BOARD_ROW_H,
          ),
        )
      : 8;

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

  const isNew = (createdAt: number | undefined, category: string) => {
    if (!createdAt) return false;
    const seenKey = category as keyof typeof seenData;
    return createdAt > (seenData[seenKey] ?? 0);
  };

  const formatDate = (createdAt: number) =>
    new Date(createdAt * 1000)
      .toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
      .replace('. ', '/')
      .replace('.', '');

  const totalReviewCount = summaries.reduce((sum, s) => sum + s.reviewCount, 0);

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleClearSearch,
    activeSearchQuery,
    searchResults,
    activeFilter,
    setActiveFilter: handleFilterChange,
    isNew,
    formatDate,
    totalReviewCount,
    displayPosts,
    currentPage,
    setCurrentPage,
    isLoading: !isLoaded,
    topPosts,
    top3DocIds,
    pagedPosts,
    totalPages,
    showPagination,
    visiblePages,
    rightColH,
  };
};
