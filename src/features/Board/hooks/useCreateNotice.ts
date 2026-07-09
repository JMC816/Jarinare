/**
 * @role: features — 공지사항 게시글 생성 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { createNoticeApi } from '../api/createNoticeApi';

export const useCreateNotice = () => {
  const createNotice = async (
    author: string,
    title: string,
    content: string,
    views: number,
    likes: number,
  ) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return createNoticeApi(uid, author, title, content, views, likes);
  };
  return { createNotice };
};
