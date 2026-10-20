/**
 * @role: features — 게시물 좋아요 상태·토글 훅
 * @rule: api/ 호출만 담당, 외부 서비스 직접 호출 금지
 */
import { useEffect, useRef, useState } from 'react';
import { BoardPost } from '@/entities/Board/types/boardType';
import { getLikedBoardIdsApi, toggleBoardLikeApi } from '../api/likeBoardApi';

export const useLikeBoard = (items: BoardPost[]) => {
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const [likesOverrideMap, setLikesOverrideMap] = useState<
    Record<number, number>
  >({});
  const processingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (items.length === 0) return;
    getLikedBoardIdsApi()
      .then((ids) => {
        const map: Record<number, boolean> = {};
        ids.forEach((id) => {
          map[id] = true;
        });
        setLikedMap(map);
      })
      .catch(() => {});
  }, [items.length]);

  // items 변경 시 override 맵 초기화
  useEffect(() => {
    setLikesOverrideMap({});
  }, [items]);

  const handleClickLike = async (boardId: number) => {
    if (processingRef.current.has(boardId)) return;
    processingRef.current.add(boardId);

    const isCurrentlyLiked = likedMap[boardId] ?? false;
    const currentCount =
      likesOverrideMap[boardId] ??
      items.find((p) => p.id === boardId)?.liked ??
      0;

    // 낙관적 업데이트
    setLikedMap((prev) => ({ ...prev, [boardId]: !isCurrentlyLiked }));
    setLikesOverrideMap((prev) => ({
      ...prev,
      [boardId]: currentCount + (isCurrentlyLiked ? -1 : 1),
    }));

    try {
      const { liked, isLiked } = await toggleBoardLikeApi(boardId);
      setLikedMap((prev) => ({ ...prev, [boardId]: isLiked }));
      setLikesOverrideMap((prev) => ({ ...prev, [boardId]: liked }));
    } catch {
      setLikedMap((prev) => ({ ...prev, [boardId]: isCurrentlyLiked }));
      setLikesOverrideMap((prev) => ({ ...prev, [boardId]: currentCount }));
    } finally {
      processingRef.current.delete(boardId);
    }
  };

  // 기존 호출부와 동일한 인터페이스 유지 (string key)
  const likesMap: Record<string, number> = {};
  const likedMapStr: Record<string, boolean> = {};
  items.forEach((p) => {
    likesMap[String(p.id)] = likesOverrideMap[p.id] ?? p.liked;
    likedMapStr[String(p.id)] = likedMap[p.id] ?? false;
  });

  return {
    likedMap: likedMapStr,
    likesMap,
    handleClickLike: (boardId: string) => handleClickLike(Number(boardId)),
  };
};
