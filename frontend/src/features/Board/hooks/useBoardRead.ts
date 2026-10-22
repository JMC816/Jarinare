// @role: features/hooks
// @rule: 게시물 읽음 상태 조회·처리만 담당
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { markBoardReadApi, getReadBoardIdsApi } from '../api/boardReadApi';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

export const useBoardRead = () => {
  const { isLoggedIn } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: readIds = [] } = useQuery({
    queryKey: ['boardReadIds'],
    queryFn: getReadBoardIdsApi,
    enabled: isLoggedIn,
  });

  const markRead = async (boardId: number) => {
    if (!isLoggedIn) return;
    if (readIds.includes(boardId)) return;
    await markBoardReadApi(boardId);
    queryClient.setQueryData<number[]>(['boardReadIds'], (prev = []) => [...prev, boardId]);
  };

  return { readIds, markRead };
};
