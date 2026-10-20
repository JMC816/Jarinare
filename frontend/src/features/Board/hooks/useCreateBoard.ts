/**
 * @role: features — 게시물 생성 훅
 * @rule: api/ 호출만 담당
 */
import { createBoardApi, CreateBoardParams } from '../api/createBoardApi';

export const useCreateBoard = () => {
  const createBoard = async (params: CreateBoardParams): Promise<{ id: number } | undefined> => {
    try {
      return await createBoardApi(params);
    } catch (error) {
      console.error('[useCreateBoard]', error);
    }
  };
  return { createBoard };
};
