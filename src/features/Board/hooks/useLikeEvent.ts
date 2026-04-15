import { BoardPost } from '@/entities/Board/types/boardType';
import { auth, db } from '@/shared/firebase/firebase';
import {
  doc,
  getDocs,
  collection,
  increment,
  runTransaction,
  onSnapshot,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

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

    // 기존 리스너 정리
    listenersRef.current.forEach((unsub) => unsub());
    listenersRef.current = [];

    items.forEach((item) => {
      const docId = item.id.split('/').pop()!;
      const countRef = doc(db, 'eventLikes', docId);

      const unsub = onSnapshot(countRef, (snap) => {
        const count = snap.exists()
          ? (snap.data().count ?? 0)
          : (item.likes ?? 0);
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

    const fetchLiked = async () => {
      const snap = await getDocs(
        collection(db, 'isLiked', user.uid, 'eventVotes'),
      );
      const likedDocIds: Record<string, boolean> = {};
      snap.forEach((d) => {
        likedDocIds[d.id] = d.data()?.liked === true;
      });
      const likedByPath: Record<string, boolean> = {};
      items.forEach((item) => {
        const docId = item.id.split('/').pop()!;
        likedByPath[item.id] = likedDocIds[docId] ?? false;
      });
      setLikedMap(likedByPath);
    };

    fetchLiked();
  }, [user, items.length]);

  const handleClickLike = async (eventId: string) => {
    console.log(eventId);

    if (!user) return;

    const isCurrentlyLiked = likedMap[eventId] ?? false;
    const docId = eventId.split('/').pop()!;

    // 낙관적 업데이트
    setLikedMap((prev) => ({ ...prev, [eventId]: !isCurrentlyLiked }));
    setLikesMap((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] ?? 0) + (isCurrentlyLiked ? -1 : 1),
    }));

    try {
      const likeRef = doc(db, 'isLiked', user.uid, 'eventVotes', docId);
      const countRef = doc(db, 'eventLikes', docId);

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
    } catch (error) {
      console.error(
        '이벤트 좋아요 오류 (Firebase 규칙 또는 네트워크 확인):',
        error,
      );
      // 낙관적 업데이트 롤백
      setLikedMap((prev) => ({ ...prev, [eventId]: isCurrentlyLiked }));
      setLikesMap((prev) => ({
        ...prev,
        [eventId]: (prev[eventId] ?? 0) + (isCurrentlyLiked ? 1 : -1),
      }));
    }
  };

  return { likedMap, likesMap, handleClickLike };
};
