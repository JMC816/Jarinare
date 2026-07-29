/**
 * @role: features/api — 게시판 카테고리별 최신 게시물 조회
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { db } from '@/shared/firebase/firebase';
import {
  collection,
  collectionGroup,
  getDocs,
  query,
  Timestamp,
} from 'firebase/firestore';
import { LatestPost } from '../types/boardType';

const toSeconds = (ts: Timestamp): number => {
  if (typeof ts?.seconds === 'number') return ts.seconds;
  if (typeof ts?.toMillis === 'function')
    return Math.floor(ts.toMillis() / 1000);
  return 0;
};

export const fetchLatestPostsApi = async (
  category: string,
  n: number,
): Promise<(LatestPost | null)[]> => {
  const snap = await getDocs(query(collectionGroup(db, category)));
  if (snap.empty) return Array(n).fill(null);

  const docs = snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title ?? '',
        content: data.content ?? '',
        author: data.author ?? '',
        viewCount: data.views ?? data.viewCount ?? 0,
        createdAt: toSeconds(data.createdAt),
      };
    })
    .filter((d) => d.title)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, n);

  const withComments = await Promise.all(
    docs.map(async (post) => {
      const commentsSnap = await getDocs(
        collection(db, 'boardComments', post.id, 'items'),
      );
      return { ...post, commentCount: commentsSnap.size };
    }),
  );

  return Array.from({ length: n }, (_, i) => withComments[i] ?? null);
};
