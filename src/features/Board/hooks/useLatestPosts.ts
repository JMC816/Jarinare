/**
 * @role: features — 게시판 카테고리별 최신 게시물 조회 훅
 * @rule: 상태·사이드이펙트만 담당, UI 로직 포함 금지
 */
import { db } from '@/shared/firebase/firebase';
import { collectionGroup, getDocs, query, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { LatestPost, LatestPosts } from '../types/boardType';

const toSeconds = (ts: Timestamp): number => {
  if (typeof ts?.seconds === 'number') return ts.seconds;
  if (typeof ts?.toMillis === 'function')
    return Math.floor(ts.toMillis() / 1000);
  return 0;
};

const fetchLatestN = async (
  category: string,
  n: number,
): Promise<(LatestPost | null)[]> => {
  const snap = await getDocs(query(collectionGroup(db, category)));
  if (snap.empty) return Array(n).fill(null);

  const docs = snap.docs
    .map((d) => {
      const data = d.data();
      return {
        title: data.title ?? '',
        content: data.content ?? '',
        author: data.author ?? '',
        viewCount: data.views ?? data.viewCount ?? 0,
        createdAt: toSeconds(data.createdAt),
      };
    })
    .filter((d) => d.title)
    .sort((a, b) => b.createdAt - a.createdAt);

  return Array.from({ length: n }, (_, i) => docs[i] ?? null);
};

export const useLatestPosts = () => {
  const [latest, setLatest] = useState<LatestPosts>({
    notice: null,
    event: null,
    board: null,
    board2: null,
  });

  useEffect(() => {
    const load = async () => {
      const [[notice], [event], [board, board2]] = await Promise.all([
        fetchLatestN('notice', 1),
        fetchLatestN('event', 1),
        fetchLatestN('board', 2),
      ]);
      setLatest({ notice, event, board, board2 });
    };
    load();
  }, []);

  return { latest };
};
