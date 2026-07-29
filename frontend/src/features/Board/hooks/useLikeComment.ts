/**
 * @role: features — 댓글 좋아요 상태·토글 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  fetchCommentLikedStateApi,
  subscribeCommentLikeCountApi,
  toggleCommentLikeApi,
} from '../api/likeCommentApi';

export const useLikeComment = (commentIds: string[]) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const listenersRef = useRef<(() => void)[]>([]);
  const processingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // commentIds 변경 시 commentLikes/{commentId} 실시간 구독
  useEffect(() => {
    if (commentIds.length === 0) return;

    listenersRef.current.forEach((unsub) => unsub());
    listenersRef.current = [];

    commentIds.forEach((id) => {
      const unsub = subscribeCommentLikeCountApi(id, (count) => {
        setLikesMap((prev) => ({ ...prev, [id]: count }));
      });
      listenersRef.current.push(unsub);
    });

    return () => {
      listenersRef.current.forEach((unsub) => unsub());
      listenersRef.current = [];
    };
  }, [commentIds.join(',')]);

  // 로그인 유저의 좋아요 상태 로드
  useEffect(() => {
    if (!user || commentIds.length === 0) return;

    fetchCommentLikedStateApi(user.uid).then((likedDocIds) => {
      setLikedMap(likedDocIds);
    });
  }, [user, commentIds.join(',')]);

  const handleClickLike = async (commentId: string) => {
    if (!user || processingRef.current.has(commentId)) return;
    processingRef.current.add(commentId);

    const isCurrentlyLiked = likedMap[commentId] ?? false;

    setLikedMap((prev) => ({ ...prev, [commentId]: !isCurrentlyLiked }));
    setLikesMap((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] ?? 0) + (isCurrentlyLiked ? -1 : 1),
    }));

    try {
      await toggleCommentLikeApi(user.uid, commentId, isCurrentlyLiked);
    } catch {
      setLikedMap((prev) => ({ ...prev, [commentId]: isCurrentlyLiked }));
      setLikesMap((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] ?? 0) + (isCurrentlyLiked ? 1 : -1),
      }));
    } finally {
      processingRef.current.delete(commentId);
    }
  };

  return { likedMap, likesMap, handleClickLike };
};
