/**
 * @role: features — 게시물 댓글 실시간 조회 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { Comment } from '@/entities/Board/types/commentType';
import { useEffect, useState } from 'react';
import { subscribeCommentsApi } from '../api/commentsApi';

export const useComments = (postDocId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!postDocId) return;

    const unsubscribe = subscribeCommentsApi(postDocId, (items) => {
      setComments(items);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [postDocId]);

  return { comments, isLoaded };
};
