/**
 * @role: pages — PC 자유게시판 상세 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useLikeBoard } from '@/features/Board/hooks/useLikeBoard';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { useBookmark } from '@/features/Board/hooks/useBookmark';
import { incrementShareApi } from '@/features/Board/api/topViewedPostApi';

export const usePCBoardDetailPage = (post: BoardPost | undefined) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentPost = post ?? null;
  const postDocId = currentPost ? String(currentPost.id) : '';

  const postItems = useMemo(
    () => (currentPost ? [currentPost] : []),
    [currentPost?.id],
  );
  const { likedMap, likesMap, handleClickLike } = useLikeBoard(postItems);
  const { deletePost } = useDeletePost();
  const { user: currentUser, isLoggedIn } = useCurrentUser();
  const { isBookmarked, toggleBookmark } = useBookmark(currentPost?.id);

  const isOwner = !!currentUser?.name && currentUser.name === currentPost?.author;
  const isLiked = likedMap[postDocId] ?? false;
  const likesCount = likesMap[postDocId] ?? 0;
  const viewCount = currentPost?.views ?? 0;

  const handleDelete = async () => {
    if (!currentPost) return;
    await deletePost(currentPost.id, 'free');
    navigate(-1);
  };

  const handleEdit = () => {
    if (!currentPost) return;
    navigate('/board/board', { state: { editPost: currentPost } });
  };

  const handleShare = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (currentPost && isLoggedIn) incrementShareApi(currentPost.id).catch(() => {});
  }, [currentPost?.id]);

  const handleLike = () => {
    if (!currentPost) return;
    handleClickLike(postDocId);
  };

  const handleBookmark = () => {
    if (!currentPost) return;
    toggleBookmark(currentPost.id);
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
    handleShare,
    copied,
    isBookmarked,
    handleBookmark,
  };
};
