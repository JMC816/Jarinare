/**
 * @role: features/api — 게시판 목록·상세 조회
 * @rule: backendClient 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';
import {
  BoardListResponse,
  BoardType,
  FreeBoardDetail,
  BoardDetail,
  ReviewDetail,
  SortOrder,
} from '@/entities/Board/types/boardType';

export interface BoardListParams {
  type: BoardType;
  page?: number;
  size?: number;
  search?: string;
  sort?: SortOrder;
}

export const getBoardPostsApi = async (
  params: BoardListParams,
): Promise<BoardListResponse> => {
  const res = await backendClient.get<BoardListResponse>('/api/board', {
    params,
  });
  return res.data;
};

export async function getBoardDetailApi(
  id: number,
  type: 'free',
): Promise<FreeBoardDetail>;
export async function getBoardDetailApi(
  id: number,
  type: 'review',
): Promise<ReviewDetail>;
export async function getBoardDetailApi(
  id: number,
  type: 'notice' | 'event',
): Promise<BoardDetail>;
export async function getBoardDetailApi(
  id: number,
  type: BoardType,
): Promise<FreeBoardDetail | ReviewDetail | BoardDetail> {
  const res = await backendClient.get(`/api/board/${id}`, { params: { type } });
  return res.data;
}
