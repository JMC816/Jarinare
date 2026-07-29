/**
 * @role: features/api — 댓글 수정
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { db } from '@/shared/firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const updateCommentApi = async (
  postDocId: string,
  commentId: string,
  content: string,
): Promise<void> => {
  await updateDoc(doc(db, 'boardComments', postDocId, 'items', commentId), {
    content: content.trim(),
  });
};
