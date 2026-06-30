/**
 * @role: pages — PC 공지사항 목록 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { useGetNotice } from '@/features/Board/hooks/useGetNotice';

export const usePCNoticeListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { noticeData } = useGetNotice();

  const totalCount = noticeData.length;

  return {
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    totalCount,
  };
};
