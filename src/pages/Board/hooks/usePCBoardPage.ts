/**
 * @role: pages — PCBoardPage 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardSeen } from '@/features/Board/hooks/useBoardSeen';
import { useDestinationRatings } from '@/features/TravelReview/hooks/useDestinationRatings';

export const usePCBoardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [boardDropdownOpen, setBoardDropdownOpen] = useState(false);
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

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
    boardDropdownOpen,
    setBoardDropdownOpen,
    isNew,
    formatDate,
    totalReviewCount,
  };
};
