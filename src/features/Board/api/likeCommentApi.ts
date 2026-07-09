/**
 * @role: features/api — 댓글 좋아요 조회·구독·토글
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

export const fetchCommentLikedStateApi = async (
  uid: string,
): Promise<Record<string, boolean>> => {
  const snap = await getDocs(collection(db, 'isLiked', uid, 'commentVotes'));
  const result: Record<string, boolean> = {};
  snap.forEach((d) => {
    result[d.id] = d.data()?.liked === true;
  });
  return result;
};

export const subscribeCommentLikeCountApi = (
  commentId: string,
  onCount: (count: number) => void,
): (() => void) => {
  const countRef = doc(db, 'commentLikes', commentId);
  return onSnapshot(countRef, (snap) => {
    onCount(snap.exists() ? (snap.data().count ?? 0) : 0);
  });
};

export const toggleCommentLikeApi = async (
  uid: string,
  commentId: string,
  isCurrentlyLiked: boolean,
): Promise<void> => {
  const likeRef = doc(db, 'isLiked', uid, 'commentVotes', commentId);
  const countRef = doc(db, 'commentLikes', commentId);

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
