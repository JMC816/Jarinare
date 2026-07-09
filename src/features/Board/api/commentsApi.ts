/**
 * @role: features/api — 게시물 댓글 실시간 구독
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { Comment } from '@/entities/Board/types/commentType';
import { db } from '@/shared/firebase/firebase';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';

const toSeconds = (ts: Timestamp): number => {
  if (typeof ts?.seconds === 'number') return ts.seconds;
  if (typeof ts?.toMillis === 'function')
    return Math.floor(ts.toMillis() / 1000);
  return 0;
};

export const subscribeCommentsApi = (
  postDocId: string,
  onComments: (comments: Comment[]) => void,
): (() => void) => {
  const q = query(
    collection(db, 'boardComments', postDocId, 'items'),
    orderBy('createdAt', 'asc'),
  );

  return onSnapshot(q, (snap) => {
    const items: Comment[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid: data.uid,
        author: data.author,
        content: data.content,
        createdAt: toSeconds(data.createdAt),
        parentId: data.parentId ?? null,
      };
    });
    onComments(items);
  });
};
