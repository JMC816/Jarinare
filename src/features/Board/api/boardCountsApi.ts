/**
 * @role: features/api — 게시판 카테고리별 게시물 수 조회
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { db } from '@/shared/firebase/firebase';
import { collectionGroup, getDocs, query } from 'firebase/firestore';

export const getBoardCountsApi = async (): Promise<{
  notice: number;
  event: number;
  board: number;
}> => {
  const [noticeSnap, eventSnap, boardSnap] = await Promise.all([
    getDocs(query(collectionGroup(db, 'notice'))),
    getDocs(query(collectionGroup(db, 'event'))),
    getDocs(query(collectionGroup(db, 'board'))),
  ]);
  return {
    notice: noticeSnap.size,
    event: eventSnap.size,
    board: boardSnap.size,
  };
};
