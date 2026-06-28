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

const TOP_COUNT = 5;

export const useTopViewedPost = () => {
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);

  useEffect(() => {
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

      // boardViews 실시간 구독 — 조회수 상위 TOP_COUNT개 추출
      const unsubscribe = onSnapshot(collection(db, 'boardViews'), (snap) => {
        const ranked = snap.docs
          .filter((d) => postMap[d.id])
          .map((d) => ({ ...postMap[d.id], viewCount: d.data()?.count ?? 0 }))
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, TOP_COUNT);

        setTopPosts(ranked);
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

  return { topPosts };
};
