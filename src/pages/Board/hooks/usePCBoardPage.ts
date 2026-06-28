/**
 * @role: pages — PCBoardPage 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardSeen } from '@/features/Board/hooks/useBoardSeen';
import { useDestinationRatings } from '@/features/TravelReview/hooks/useDestinationRatings';
import { BOARDS } from '../constants/boardPageConstants';
import { BoardFilter } from '../types/boardPageType';
import { LatestPost } from '@/features/Board/types/boardType';

export type { BoardFilter };

export const usePCBoardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<BoardFilter>('전체');
  const navigate = useNavigate();
  const { seenData } = useBoardSeen();
  const { summaries } = useDestinationRatings();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/board/boardlist', {
        state: { searchQuery: searchQuery.trim() },
      });
    }
  };

  const isNew = (createdAt: number | undefined, category: string) => {
    if (!createdAt) return false;
    const seenKey = (
      category === 'board2' ? 'board' : category
    ) as keyof typeof seenData;
    return createdAt > (seenData[seenKey] ?? 0);
  };

  const formatDate = (createdAt: number) =>
    new Date(createdAt * 1000)
      .toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
      .replace('. ', '/')
      .replace('.', '');

  const totalReviewCount = summaries.reduce((sum, s) => sum + s.reviewCount, 0);

  const filteredBoards = BOARDS.filter((b) => {
    if (activeFilter === '전체') return true;
    if (activeFilter === '공지') return b.key === 'notice';
    if (activeFilter === '자유') return b.key === 'board' || b.key === 'board2';
    return false;
  });

  const getDetailNav = (key: string, post: LatestPost) => {
    const detailPath =
      key === 'notice'
        ? '/board/notice/detail'
        : key === 'event'
          ? '/board/event/detail'
          : '/board/board/detail';
    const stateKey =
      key === 'notice' ? 'notice' : key === 'event' ? 'event' : 'post';
    return {
      path: detailPath,
      state: {
        [stateKey]: {
          id: post.id,
          title: post.title,
          content: post.content,
          author: post.author,
          likes: 0,
          views: post.viewCount,
          createdAt: post.createdAt,
          imageUrl: null,
        },
      },
    };
  };

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
    activeFilter,
    setActiveFilter,
    isNew,
    formatDate,
    totalReviewCount,
    filteredBoards,
    getDetailNav,
  };
};
