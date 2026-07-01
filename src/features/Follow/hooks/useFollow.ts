/**
 * @role: features — 팔로우 토글 및 팔로우 상태 조회
 * @rule: Firebase 읽기/쓰기만 담당, UI 포함 금지
 */
import { auth, db, realtimeDb } from '@/shared/firebase/firebase';
import { doc, getDoc, setDoc, deleteDoc, increment } from 'firebase/firestore';
import {
  push,
  ref,
  serverTimestamp as rtServerTimestamp,
} from 'firebase/database';
import { useEffect, useState } from 'react';

export const useFollow = (targetUid: string, targetName: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  // 팔로우 여부 초기 조회
  useEffect(() => {
    if (!user || !targetUid || user.uid === targetUid) return;

    const followingRef = doc(db, 'follows', user.uid, 'following', targetUid);
    getDoc(followingRef).then((snap) => setIsFollowing(snap.exists()));
  }, [user?.uid, targetUid]);

  const toggleFollow = async () => {
    if (!user || !targetUid || user.uid === targetUid || loading) return;
    setLoading(true);

    const followerUid = user.uid;
    const followerName = user.displayName ?? user.uid;

    const myFollowingRef = doc(
      db,
      'follows',
      followerUid,
      'following',
      targetUid,
    );
    const targetFollowerRef = doc(
      db,
      'follows',
      targetUid,
      'followers',
      followerUid,
    );
    const targetCountRef = doc(db, 'followerCounts', targetUid);

    try {
      if (isFollowing) {
        // 언팔로우
        await Promise.all([
          deleteDoc(myFollowingRef),
          deleteDoc(targetFollowerRef),
          setDoc(targetCountRef, { count: increment(-1) }, { merge: true }),
        ]);
        setIsFollowing(false);
      } else {
        // 팔로우
        const now = Date.now();
        await Promise.all([
          setDoc(myFollowingRef, { name: targetName, followedAt: now }),
          setDoc(targetFollowerRef, { name: followerName, followedAt: now }),
          setDoc(targetCountRef, { count: increment(1) }, { merge: true }),
        ]);

        // 대상 사용자에게 팔로우 알림 전송
        await push(ref(realtimeDb, `${targetUid}_follow`), {
          followerUid,
          followerName,
          isRead: false,
          createdAt: rtServerTimestamp(),
        });

        setIsFollowing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, loading, toggleFollow };
};
