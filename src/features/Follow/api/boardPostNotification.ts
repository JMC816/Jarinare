/**
 * @role: features — 게시글 작성 시 팔로우 관련 알림 전송
 * @rule: Firebase 쓰기만 담당, UI·훅 포함 금지
 */
import { db, realtimeDb } from '@/shared/firebase/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import {
  push,
  ref,
  serverTimestamp as rtServerTimestamp,
} from 'firebase/database';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const sendBoardPostNotifications = async (
  posterUid: string,
  posterName: string,
  postDocId?: string,
) => {
  const now = Date.now();
  const throttleRef = doc(db, 'notifThrottle', posterUid);
  const throttleSnap = await getDoc(throttleRef);
  const throttle = throttleSnap.data() ?? {};

  // --- 1. 팔로우 최다 보유자 알림 ---
  const topSnap = await getDocs(
    query(collection(db, 'followerCounts'), orderBy('count', 'desc'), limit(1)),
  );

  if (!topSnap.empty && topSnap.docs[0].id === posterUid) {
    const lastSent: number = throttle.topFollowerLastSent ?? 0;
    if (now - lastSent >= WEEK_MS) {
      const allUsersSnap = await getDocs(collection(db, 'users'));
      await Promise.all(
        allUsersSnap.docs
          .filter((d) => d.id !== posterUid)
          .map((d) =>
            push(ref(realtimeDb, `${d.id}_topFollower`), {
              posterUid,
              posterName,
              postDocId: postDocId ?? null,
              isRead: false,
              createdAt: rtServerTimestamp(),
            }),
          ),
      );
      await setDoc(throttleRef, { topFollowerLastSent: now }, { merge: true });
    }
  }

  // --- 2. 팔로잉 사용자 게시글 알림 ---
  const lastSent: number = throttle.followPostLastSent ?? 0;
  if (now - lastSent >= WEEK_MS) {
    const followersSnap = await getDocs(
      collection(db, 'follows', posterUid, 'followers'),
    );
    if (!followersSnap.empty) {
      await Promise.all(
        followersSnap.docs.map((d) =>
          push(ref(realtimeDb, `${d.id}_followPost`), {
            posterUid,
            posterName,
            isRead: false,
            createdAt: rtServerTimestamp(),
          }),
        ),
      );
      await setDoc(throttleRef, { followPostLastSent: now }, { merge: true });
    }
  }
};
