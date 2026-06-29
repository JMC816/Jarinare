/**
 * @role: features — 댓글 좋아요 상태·토글 훅
 * @rule: 상태·사이드이펙트만 담당, UI 로직 포함 금지
 */
import { auth, db } from '@/shared/firebase/firebase';
import {
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  runTransaction,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';

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
      const countRef = doc(db, 'commentLikes', id);
      const unsub = onSnapshot(countRef, (snap) => {
        const count = snap.exists() ? (snap.data().count ?? 0) : 0;
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

    const fetchLiked = async () => {
      const snap = await getDocs(
        collection(db, 'isLiked', user.uid, 'commentVotes'),
      );
      const likedDocIds: Record<string, boolean> = {};
      snap.forEach((d) => {
        likedDocIds[d.id] = d.data()?.liked === true;
      });
      setLikedMap(likedDocIds);
    };

    fetchLiked();
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
      const likeRef = doc(db, 'isLiked', user.uid, 'commentVotes', commentId);
      const countRef = doc(db, 'commentLikes', commentId);

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(likeRef);
        const current = snap.exists() && snap.data()?.liked === true;

        if (current) {
          transaction.set(likeRef, { liked: false }, { merge: true });
          transaction.set(countRef, { count: increment(-1) }, { merge: true });
        } else {
          transaction.set(likeRef, { liked: true }, { merge: true });
          transaction.set(countRef, { count: increment(1) }, { merge: true });
        }
      });
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
