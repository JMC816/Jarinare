/**
 * @role: widgets — 이벤트 목록 상태·핸들러
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useEventPagination } from '@/features/Board/hooks/useEventPagination';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

type SortOrder = 'newest' | 'oldest';

export const useEvent = (
  isPC: boolean,
  externalSearchQuery?: string,
  externalSortOrder?: SortOrder,
) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  const searchQuery = isPC ? (externalSearchQuery ?? '') : internalSearchQuery;
  const activeSortOrder = isPC ? (externalSortOrder ?? 'newest') : sortOrder;

  const { ref, items, isFetching } = useEventPagination(
    searchQuery,
    activeSortOrder,
  );
  const { deletePost } = useDeletePost();
  const { user } = useCurrentUser();
  const currentUid = user?.userId;

  const displayedItems = items.filter((p) => !deletedIds.has(p.id));

  const handleDelete = async (post: BoardPost) => {
    await deletePost(post.id, 'event');
    setDeletedIds((prev) => new Set(prev).add(post.id));
    setMenuOpenId(null);
  };

  return {
    internalSearchQuery,
    setInternalSearchQuery,
    sortOrder,
    setSortOrder,
    filterOpen,
    setFilterOpen,
    menuOpenId,
    setMenuOpenId,
    searchQuery,
    ref,
    items,
    isFetching,
    displayedItems,
    handleDelete,
    currentUid,
  };
};
