/**
 * @role: features — 게시물 댓글 조회 훅
 * @rule: api/ 호출만 담당
 */
import { Comment } from '@/entities/Board/types/commentType';
import { useEffect, useState } from 'react';
import { getCommentsApi } from '../api/commentsApi';

export const useComments = (boardId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (!boardId) return;
    setIsLoaded(false);
    getCommentsApi(boardId)
      .then(setComments)
      .catch((e) => console.error('[useComments]', e))
      .finally(() => setIsLoaded(true));
  }, [boardId, refreshKey]);

  return { comments, isLoaded, refresh };
};
