/**
 * @role: pages — PC 이벤트 상세 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

export const usePCEventDetailPage = (event: BoardPost | undefined) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentPost = event ?? null;

  const { deletePost } = useDeletePost();
  const { user: currentUser } = useCurrentUser();

  const isOwner = !!currentUser?.name && currentUser.name === currentPost?.author;
  const viewCount = currentPost?.views ?? 0;

  const handleDelete = async () => {
    if (!currentPost) return;
    await deletePost(currentPost.id, 'event');
    navigate(-1);
  };

  return {
    currentPost,
    isOwner,
    viewCount,
    menuOpen,
    setMenuOpen,
    handleDelete,
  };
};
