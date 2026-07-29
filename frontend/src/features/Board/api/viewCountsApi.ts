/**
 * @role: features/api — 게시물 목록 조회수 일괄 구독
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { db } from '@/shared/firebase/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const subscribeViewCountsApi = (
  items: BoardPost[],
  onCounts: (id: string, count: number) => void,
): (() => void) => {
  const unsubscribes = items.map((item) => {
    const docId = item.id.split('/').pop() ?? '';
    return onSnapshot(doc(db, 'boardViews', docId), (snap) => {
      onCounts(item.id, snap.data()?.count ?? 0);
    });
  });
  return () => unsubscribes.forEach((unsub) => unsub());
};
