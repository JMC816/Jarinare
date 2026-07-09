/**
 * @role: features/api — 조회수 상위 게시물 조회·구독
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { db } from '@/shared/firebase/firebase';
import {
  collection,
  collectionGroup,
  getDocs,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { TopPost } from '../hooks/useTopViewedPost';

export const fetchBoardAndEventPostsApi = async (): Promise<
  Record<string, Omit<TopPost, 'viewCount'>>
> => {
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

  return postMap;
};

export const subscribeTopViewedPostsApi = (
  postMap: Record<string, Omit<TopPost, 'viewCount'>>,
  topCount: number,
  onPosts: (posts: TopPost[]) => void,
): (() => void) => {
  return onSnapshot(collection(db, 'boardViews'), (snap) => {
    const ranked = snap.docs
      .filter((d) => postMap[d.id])
      .map((d) => ({ ...postMap[d.id], viewCount: d.data()?.count ?? 0 }))
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, topCount);
    onPosts(ranked);
  });
};
