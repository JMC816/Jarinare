/**
 * @role: features — 이벤트 게시글 생성 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { createEventApi } from '../api/createEventApi';

export const useCreateEvent = () => {
  const createEvent = async (
    author: string,
    title: string,
    content: string,
    views: number,
    likes: number,
  ) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return createEventApi(uid, author, title, content, views, likes);
  };
  return { createEvent };
};
