/**
 * @role: pages — PC 자유게시판 상세 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useLikeBoard } from '@/features/Board/hooks/useLikeBoard';
import { useUpdatePost } from '@/features/Board/hooks/useUpdatePost';
import { useViewCount } from '@/features/Board/hooks/useViewCount';
import { useFollow } from '@/features/Follow/hooks/useFollow';
import { auth } from '@/shared/firebase/firebase';

export const usePCBoardDetailPage = (post: BoardPost | undefined) => {
  const navigate = useNavigate();
  const [localPost, setLocalPost] = useState<BoardPost | null>(null);
  const [editingPost, setEditingPost] = useState<BoardPost | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentPost = localPost ?? post ?? null;
  const postDocId = currentPost?.id.split('/').pop() ?? '';

  const postItems = useMemo(
    () => (currentPost ? [currentPost] : []),
    [currentPost?.id],
  );
  const { likedMap, likesMap, handleClickLike } = useLikeBoard(postItems);
  const { deletePost } = useDeletePost();
  const { updatePost } = useUpdatePost();
  const { viewCount } = useViewCount(postDocId);

  const currentUid = auth.currentUser?.uid;
  const authorUid = currentPost?.id.split('/')[1] ?? '';
  const isOwner = !!currentUid && authorUid === currentUid;
  const {
    isFollowing,
    loading: followLoading,
    toggleFollow,
  } = useFollow(authorUid, currentPost?.author ?? '');
  const isLiked = likedMap[currentPost?.id ?? ''] ?? false;
  const likesCount = likesMap[currentPost?.id ?? ''] ?? currentPost?.likes ?? 0;

  const handleDelete = async () => {
    if (!currentPost) return;
    await deletePost(currentPost.id);
    navigate(-1);
  };

  const handleUpdate = async (title: string, content: string) => {
    if (!currentPost) return;
    await updatePost(currentPost.id, { title, content });
    setLocalPost({ ...currentPost, title, content });
    setEditingPost(null);
  };

  const handleLike = () => {
    if (!currentPost) return;
    handleClickLike(currentPost.id);
  };

  return {
    currentPost,
    postDocId,
    isOwner,
    isLiked,
    likesCount,
    viewCount,
    editingPost,
    setEditingPost,
    menuOpen,
    setMenuOpen,
    handleDelete,
    handleUpdate,
    handleLike,
    isFollowing,
    followLoading,
    toggleFollow,
  };
};
