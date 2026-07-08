/**
 * @role: pages — PC 공지사항 목록 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useMemo, useState } from 'react';
import { useGetNotice } from '@/features/Board/hooks/useGetNotice';
import { useViewCounts } from '@/features/Board/hooks/useViewCounts';
import { useUpdatePost } from '@/features/Board/hooks/useUpdatePost';
import { BoardPost } from '@/entities/Board/types/boardType';
import { auth } from '@/shared/firebase/firebase';

const PAGE_SIZE = 10;

export const usePCNoticeListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(0);
  const [updatedItems, setUpdatedItems] = useState<
    Record<string, Partial<BoardPost>>
  >({});
  const [editingPost, setEditingPost] = useState<BoardPost | null>(null);

  const { noticeData, isLoaded } = useGetNotice();
  const { updatePost } = useUpdatePost();

  const isAdmin = auth.currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL;

  // 수정 반영 후 정렬
  const processedData = useMemo(() => {
    const merged = noticeData.map(
      (p) => ({ ...p, ...updatedItems[p.id] }) as BoardPost,
    );
    return [...merged].sort((a, b) =>
      sortOrder === 'newest'
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt,
    );
  }, [noticeData, updatedItems, sortOrder]);

  // 검색 필터
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return processedData;
    return processedData.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q),
    );
  }, [processedData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const pagedData = filteredData.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  const visiblePages = useMemo(() => {
    const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
    const end = Math.min(totalPages, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const { viewsMap } = useViewCounts(pagedData);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(0);
  };

  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    setCurrentPage(0);
  };

  const handleUpdate = async (title: string, content: string) => {
    if (!editingPost) return;
    await updatePost(editingPost.id, { title, content });
    setUpdatedItems((prev) => ({
      ...prev,
      [editingPost.id]: { title, content },
    }));
    setEditingPost(null);
  };

  const formatDate = (createdAt: number) =>
    new Date(createdAt * 1000)
      .toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
      .replace('. ', '/')
      .replace('.', '');

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    sortOrder,
    setSortOrder: handleSortChange,
    currentPage,
    setCurrentPage,
    pagedData,
    filteredData,
    totalPages,
    visiblePages,
    isLoading: !isLoaded,
    viewsMap,
    isAdmin,
    editingPost,
    setEditingPost,
    handleUpdate,
    formatDate,
  };
};
