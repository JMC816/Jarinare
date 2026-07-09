/**
 * @role: features — 게시물 조회수 증가·구독 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { useEffect, useRef, useState } from 'react';
import {
  incrementViewCountApi,
  subscribeViewCountApi,
} from '../api/viewCountApi';

export const useViewCount = (postDocId: string) => {
  const [viewCount, setViewCount] = useState(0);
  const incremented = useRef(false);

  useEffect(() => {
    if (!postDocId) return;

    // StrictMode 이중 실행 방어
    if (!incremented.current) {
      incremented.current = true;
      incrementViewCountApi(postDocId);
    }

    const unsubscribe = subscribeViewCountApi(postDocId, (count) => {
      setViewCount(count);
    });

    return () => unsubscribe();
  }, [postDocId]);

  return { viewCount };
};
