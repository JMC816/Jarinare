/**
 * @role: features — 게시판 카테고리별 게시물 수 조회 훅
 * @rule: 상태·사이드이펙트만 담당
 */
import { db } from '@/shared/firebase/firebase';
import { collectionGroup, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { BoardCounts } from '../types/boardType';

const fetchCount = async (category: string): Promise<number> => {
  const snap = await getDocs(query(collectionGroup(db, category)));
  return snap.size;
};

export const useBoardCounts = () => {
  const [counts, setCounts] = useState<BoardCounts>({
    notice: 0,
    event: 0,
    board: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [notice, event, board] = await Promise.all([
        fetchCount('notice'),
        fetchCount('event'),
        fetchCount('board'),
      ]);
      setCounts({ notice, event, board });
    };
    load();
  }, []);

  return { counts };
};
