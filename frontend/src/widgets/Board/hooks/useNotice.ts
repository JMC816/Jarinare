/**
 * @role: widgets — 공지사항 목록 상태·핸들러
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useNoticePageNation } from '@/features/Board/hooks/useNoticePagination';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

type SortOrder = 'newest' | 'oldest';

export const useNotice = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  const { ref, items, isFetching } = useNoticePageNation(
    searchQuery,
    sortOrder,
  );
  const { deletePost } = useDeletePost();
  const { user } = useCurrentUser();
  const currentUid = user?.userId;

  const displayedItems = items
    .filter((p) => !deletedIds.has(p.id))
    .map((p) => ({ ...p }) as BoardPost);

  const handleDelete = async (post: BoardPost) => {
    await deletePost(post.id, 'notice');
    setDeletedIds((prev) => new Set(prev).add(post.id));
    setMenuOpenId(null);
  };

  return {
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    filterOpen,
    setFilterOpen,
    menuOpenId,
    setMenuOpenId,
    ref,
    items,
    isFetching,
    displayedItems,
    handleDelete,
    currentUid,
  };
};
