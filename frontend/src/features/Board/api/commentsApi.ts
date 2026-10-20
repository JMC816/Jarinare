/**
 * @role: features/api — 게시물 댓글 조회
 * @rule: backendClient 호출만 담당, 댓글은 상세 조회 응답에 포함됨
 */
import { Comment } from '@/entities/Board/types/commentType';
import { getBoardDetailApi } from './getBoardApi';

export const getCommentsApi = async (boardId: number): Promise<Comment[]> => {
  const detail = await getBoardDetailApi(boardId, 'free');
  return detail.comments;
};
