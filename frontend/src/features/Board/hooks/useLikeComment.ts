/**
 * @role: features — 댓글 좋아요 상태·토글 훅
 * @rule: api/ 호출만 담당, 외부 서비스 직접 호출 금지
 */
import { useEffect, useRef, useState } from 'react';
import type { Comment } from '@/entities/Board/types/commentType';
import {
  getLikedCommentIdsApi,
  toggleCommentLikeApi,
} from '../api/likeCommentApi';

export const useLikeComment = (boardId: number, comments: Comment[]) => {
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const [likesOverrideMap, setLikesOverrideMap] = useState<
    Record<number, number>
  >({});
  const processingRef = useRef<Set<number>>(new Set());

  // 보드 변경 시 내가 좋아요한 댓글 ID 목록 로드
  useEffect(() => {
    if (!boardId) return;
    getLikedCommentIdsApi(boardId)
      .then((ids) => {
        const map: Record<number, boolean> = {};
        ids.forEach((id) => {
          map[id] = true;
        });
        setLikedMap(map);
      })
      .catch(() => {});
  }, [boardId]);

  // comments 변경 시 override 맵 초기화 (refresh 후 서버값으로 동기화)
  useEffect(() => {
    setLikesOverrideMap({});
  }, [comments]);

  const handleClickLike = async (commentId: number) => {
    if (processingRef.current.has(commentId)) return;
    processingRef.current.add(commentId);

    const isCurrentlyLiked = likedMap[commentId] ?? false;
    const currentCount =
      likesOverrideMap[commentId] ??
      comments.find((c) => c.id === commentId)?.liked ??
      0;

    // 낙관적 업데이트
    setLikedMap((prev) => ({ ...prev, [commentId]: !isCurrentlyLiked }));
    setLikesOverrideMap((prev) => ({
      ...prev,
      [commentId]: currentCount + (isCurrentlyLiked ? -1 : 1),
    }));

    try {
      const { liked, isLiked } = await toggleCommentLikeApi(commentId);
      setLikedMap((prev) => ({ ...prev, [commentId]: isLiked }));
      setLikesOverrideMap((prev) => ({ ...prev, [commentId]: liked }));
    } catch {
      // 롤백
      setLikedMap((prev) => ({ ...prev, [commentId]: isCurrentlyLiked }));
      setLikesOverrideMap((prev) => ({ ...prev, [commentId]: currentCount }));
    } finally {
      processingRef.current.delete(commentId);
    }
  };

  return { likedMap, likesOverrideMap, handleClickLike };
};
