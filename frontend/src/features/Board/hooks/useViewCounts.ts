/**
 * @role: features — 게시물 목록 조회수 일괄 구독 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { useEffect, useRef, useState } from 'react';
import { subscribeViewCountsApi } from '../api/viewCountsApi';

export const useViewCounts = (items: BoardPost[]) => {
  const [viewsMap, setViewsMap] = useState<Record<string, number>>({});
  const listenersRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    listenersRef.current.forEach((unsub) => unsub());
    listenersRef.current = [];

    const unsubscribe = subscribeViewCountsApi(items, (id, count) => {
      setViewsMap((prev) => ({ ...prev, [id]: count }));
    });
    listenersRef.current = [unsubscribe];

    return () => unsubscribe();
  }, [items.length]);

  return { viewsMap };
};
