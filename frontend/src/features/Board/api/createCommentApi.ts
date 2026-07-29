/**
 * @role: features/api — 댓글 생성
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { db } from '@/shared/firebase/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export const createCommentApi = async (
  postDocId: string,
  uid: string,
  author: string,
  content: string,
  parentId: string | null = null,
): Promise<void> => {
  await addDoc(collection(db, 'boardComments', postDocId, 'items'), {
    uid,
    author,
    content: content.trim(),
    parentId,
    createdAt: serverTimestamp(),
  });
};
