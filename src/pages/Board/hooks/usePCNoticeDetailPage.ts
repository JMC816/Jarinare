/**
 * @role: pages — PC 공지사항 상세 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useUpdatePost } from '@/features/Board/hooks/useUpdatePost';
import { useViewCount } from '@/features/Board/hooks/useViewCount';
import { auth } from '@/shared/firebase/firebase';

export const usePCNoticeDetailPage = (notice: BoardPost | undefined) => {
  const navigate = useNavigate();
  const [localNotice, setLocalNotice] = useState<BoardPost | null>(null);
  const [editingPost, setEditingPost] = useState<BoardPost | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentNotice = localNotice ?? notice ?? null;
  const postDocId = currentNotice?.id.split('/').pop() ?? '';

  const { deletePost } = useDeletePost();
  const { updatePost } = useUpdatePost();
  const { viewCount } = useViewCount(postDocId);

  const currentUid = auth.currentUser?.uid;
  const isOwner =
    !!currentUid && currentNotice?.id.split('/')[1] === currentUid;

  const handleDelete = async () => {
    if (!currentNotice) return;
    await deletePost(currentNotice.id);
    navigate(-1);
  };

  const handleUpdate = async (title: string, content: string) => {
    if (!currentNotice) return;
    await updatePost(currentNotice.id, { title, content });
    setLocalNotice({ ...currentNotice, title, content });
    setEditingPost(null);
  };

  return {
    currentNotice,
    isOwner,
    viewCount,
    editingPost,
    setEditingPost,
    menuOpen,
    setMenuOpen,
    handleDelete,
    handleUpdate,
  };
};
