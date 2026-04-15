import { db } from '@/shared/firebase/firebase';
import { collectionGroup, getDocs, query, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface LatestPost {
  title: string;
  content: string;
  createdAt: number;
}

interface LatestPosts {
  notice: LatestPost | null;
  event: LatestPost | null;
  board: LatestPost | null;
}

const toSeconds = (ts: Timestamp): number => {
  if (typeof ts?.seconds === 'number') return ts.seconds;
  if (typeof ts?.toMillis === 'function') return Math.floor(ts.toMillis() / 1000);
  return 0;
};

const fetchLatest = async (category: string): Promise<LatestPost | null> => {
  const snap = await getDocs(query(collectionGroup(db, category)));
  if (snap.empty) return null;

  const docs = snap.docs
    .map((d) => {
      const data = d.data();
      return {
        title: data.title ?? '',
        content: data.content ?? '',
        createdAt: toSeconds(data.createdAt),
      };
    })
    .filter((d) => d.title)
    .sort((a, b) => b.createdAt - a.createdAt);

  return docs[0] ?? null;
};

export const useLatestPosts = () => {
  const [latest, setLatest] = useState<LatestPosts>({
    notice: null,
    event: null,
    board: null,
  });

  useEffect(() => {
    const load = async () => {
      const [notice, event, board] = await Promise.all([
        fetchLatest('notice'),
        fetchLatest('event'),
        fetchLatest('board'),
      ]);
      setLatest({ notice, event, board });
    };
    load();
  }, []);

  return { latest };
};
