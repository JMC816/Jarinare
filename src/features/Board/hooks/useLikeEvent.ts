/**
 * @role: features — 이벤트 좋아요 상태·토글 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { auth } from '@/shared/firebase/firebase';
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  fetchEventLikedStateApi,
  subscribeEventLikeCountApi,
  toggleEventLikeApi,
} from '../api/likeEventApi';

export const useLikeEvent = (items: BoardPost[]) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const listenersRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // items 로드 시 eventLikes/{docId} 실시간 구독
  useEffect(() => {
    if (items.length === 0) return;

    listenersRef.current.forEach((unsub) => unsub());
    listenersRef.current = [];

    items.forEach((item) => {
      const docId = item.id.split('/').pop()!;
      const unsub = subscribeEventLikeCountApi(docId, (count) => {
        setLikesMap((prev) => ({ ...prev, [item.id]: count }));
      });
      listenersRef.current.push(unsub);
    });

    return () => {
      listenersRef.current.forEach((unsub) => unsub());
      listenersRef.current = [];
    };
  }, [items]);

  // 로그인 유저의 좋아요 상태 로드
  useEffect(() => {
    if (!user || items.length === 0) return;

    fetchEventLikedStateApi(user.uid).then((likedDocIds) => {
      const likedByPath: Record<string, boolean> = {};
      items.forEach((item) => {
        const docId = item.id.split('/').pop()!;
        likedByPath[item.id] = likedDocIds[docId] ?? false;
      });
      setLikedMap(likedByPath);
    });
  }, [user, items.length]);

  const handleClickLike = async (eventId: string) => {
    if (!user) return;

    const isCurrentlyLiked = likedMap[eventId] ?? false;
    const docId = eventId.split('/').pop()!;

    setLikedMap((prev) => ({ ...prev, [eventId]: !isCurrentlyLiked }));
    setLikesMap((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] ?? 0) + (isCurrentlyLiked ? -1 : 1),
    }));

    try {
      await toggleEventLikeApi(user.uid, docId, isCurrentlyLiked);
    } catch (error) {
      console.error('이벤트 좋아요 오류:', error);
      setLikedMap((prev) => ({ ...prev, [eventId]: isCurrentlyLiked }));
      setLikesMap((prev) => ({
        ...prev,
        [eventId]: (prev[eventId] ?? 0) + (isCurrentlyLiked ? 1 : -1),
      }));
    }
  };

  return { likedMap, likesMap, handleClickLike };
};
