/**
 * @role: features/api — 공지사항 좋아요 조회·구독·토글
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { db } from '@/shared/firebase/firebase';
import {
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  runTransaction,
} from 'firebase/firestore';

export const fetchNoticeLikedStateApi = async (
  uid: string,
): Promise<Record<string, boolean>> => {
  const snap = await getDocs(collection(db, 'isLiked', uid, 'noticeVotes'));
  const result: Record<string, boolean> = {};
  snap.forEach((d) => {
    result[d.id] = d.data()?.liked === true;
  });
  return result;
};

export const subscribeNoticeLikeCountApi = (
  docId: string,
  onCount: (count: number) => void,
): (() => void) => {
  const countRef = doc(db, 'noticeLikes', docId);
  return onSnapshot(countRef, (snap) => {
    onCount(snap.exists() ? (snap.data().count ?? 0) : 0);
  });
};

export const toggleNoticeLikeApi = async (
  uid: string,
  docId: string,
  isCurrentlyLiked: boolean,
): Promise<void> => {
  const likeRef = doc(db, 'isLiked', uid, 'noticeVotes', docId);
  const countRef = doc(db, 'noticeLikes', docId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(likeRef);
    const current = snap.exists() && snap.data()?.liked === true;

    if (current || isCurrentlyLiked) {
      transaction.set(likeRef, { liked: false }, { merge: true });
      transaction.set(countRef, { count: increment(-1) }, { merge: true });
    } else {
      transaction.set(likeRef, { liked: true }, { merge: true });
      transaction.set(countRef, { count: increment(1) }, { merge: true });
    }
  });
};
