/**
 * @role: features — 자유게시판 게시글 생성 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { createBoardApi } from '../api/createBoardApi';

export const useCreateBoard = () => {
  const createBoard = async (
    author: string,
    title: string,
    content: string,
    views: number,
    likes: number,
    tags: string[] = [],
  ) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return createBoardApi(uid, author, title, content, views, likes, tags);
  };
  return { createBoard };
};
