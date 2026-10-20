/**
 * @role: pages — PC 자유게시판 상세 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useLikeBoard } from '@/features/Board/hooks/useLikeBoard';
import { useViewCount } from '@/features/Board/hooks/useViewCount';
import { useFollow } from '@/features/Follow/hooks/useFollow';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

export const usePCBoardDetailPage = (post: BoardPost | undefined) => {
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
  const { viewCount } = useViewCount(postDocId);
  const { user: currentUser } = useCurrentUser();

  const authorName = currentPost?.author ?? '';
  const isOwner = !!currentUser?.name && currentUser.name === currentPost?.author;
  const {
    isFollowing,
    loading: followLoading,
    toggleFollow,
  } = useFollow(authorName, currentPost?.author ?? '');
  const isLiked = likedMap[postDocId] ?? false;
  const likesCount = likesMap[postDocId] ?? 0;

  const handleDelete = async () => {
    if (!currentPost) return;
    await deletePost(currentPost.id, 'free');
    navigate(-1);
  };

  const handleEdit = () => {
    if (!currentPost) return;
    navigate('/board/board', { state: { editPost: currentPost } });
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
    viewCount,
    menuOpen,
    setMenuOpen,
    handleDelete,
    handleEdit,
    handleLike,
    isFollowing,
    followLoading,
    toggleFollow,
  };
};
