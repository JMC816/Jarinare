/**
 * @role: pages — 자유게시판 상세 페이지 (모바일) 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useLikeBoard } from '@/features/Board/hooks/useLikeBoard';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

export const useBoardDetailPage = (post: BoardPost | undefined) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentPost = post ?? null;
  const postDocId = currentPost ? String(currentPost.id) : '';

  const postItems = useMemo(
    () => (currentPost ? [currentPost] : []),
    [currentPost?.id],
  );
  const { likedMap, likesMap, handleClickLike } = useLikeBoard(postItems);
  const { deletePost } = useDeletePost();
  const { user: currentUser } = useCurrentUser();

  const isOwner = !!currentUser?.name && currentUser.name === currentPost?.author;
  const isLiked = likedMap[postDocId] ?? false;
  const likesCount = likesMap[postDocId] ?? 0;

  const handleDelete = async () => {
    if (!currentPost) return;
    await deletePost(currentPost.id, 'free');
    navigate(-1);
  };

  const handleLike = () => {
    if (!currentPost) return;
    handleClickLike(postDocId);
  };

  return {
    currentPost,
    postDocId,
    isOwner,
    isLiked,
    likesCount,
    menuOpen,
    setMenuOpen,
    handleDelete,
    handleLike,
  };
};
