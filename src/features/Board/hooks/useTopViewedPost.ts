import { db } from '@/shared/firebase/firebase';
import {
  collectionGroup,
  getDocs,
  onSnapshot,
  collection,
  query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface TopPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: 'board' | 'event';
  viewCount: number;
}

export const useTopViewedPost = () => {
  const [topPost, setTopPost] = useState<TopPost | null>(null);

  useEffect(() => {
    // 모든 board, event 게시물 먼저 로드
    const loadPosts = async () => {
      const [boardSnap, eventSnap] = await Promise.all([
        getDocs(query(collectionGroup(db, 'board'))),
        getDocs(query(collectionGroup(db, 'event'))),
      ]);

      const postMap: Record<string, Omit<TopPost, 'viewCount'>> = {};

      boardSnap.docs.forEach((d) => {
        const data = d.data();
        if (!data.title) return;
        postMap[d.id] = {
          id: d.ref.path,
          title: data.title,
          content: data.content ?? '',
          author: data.author ?? '',
          category: 'board',
        };
      });

      eventSnap.docs.forEach((d) => {
        const data = d.data();
        if (!data.title) return;
        postMap[d.id] = {
          id: d.ref.path,
          title: data.title,
          content: data.content ?? '',
          author: data.author ?? '',
          category: 'event',
        };
      });

      if (Object.keys(postMap).length === 0) return;

      // boardViews 실시간 구독
      const unsubscribe = onSnapshot(collection(db, 'boardViews'), (snap) => {
        let maxCount = -1;
        let topDocId = '';

        snap.docs.forEach((d) => {
          const count = d.data()?.count ?? 0;
          if (count > maxCount && postMap[d.id]) {
            maxCount = count;
            topDocId = d.id;
          }
        });

        if (topDocId && postMap[topDocId]) {
          setTopPost({ ...postMap[topDocId], viewCount: maxCount });
        }
      });

      return unsubscribe;
    };

    let unsub: (() => void) | undefined;
    loadPosts().then((fn) => {
      unsub = fn;
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  return { topPost };
};
