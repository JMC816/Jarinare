import { Comment } from '@/entities/Board/types/commentType';
import { db } from '@/shared/firebase/firebase';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useComments = (postDocId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!postDocId) return;

    const q = query(
      collection(db, 'boardComments', postDocId, 'items'),
      orderBy('createdAt', 'asc'),
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const items: Comment[] = snap.docs.map((doc) => {
        const data = doc.data();
        const ts: Timestamp = data.createdAt;
        const createdAt =
          typeof ts?.seconds === 'number'
            ? ts.seconds
            : typeof ts?.toMillis === 'function'
              ? Math.floor(ts.toMillis() / 1000)
              : 0;

        return {
          id: doc.id,
          uid: data.uid,
          author: data.author,
          content: data.content,
          createdAt,
          parentId: data.parentId ?? null,
        };
      });
      setComments(items);
    });

    return () => unsubscribe();
  }, [postDocId]);

  return { comments };
};
