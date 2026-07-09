/**
 * @role: features/api — 공지사항 삭제
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { db } from '@/shared/firebase/firebase';
import { deleteDoc, doc } from 'firebase/firestore';

export const deleteNoticeApi = async (
  uid: string,
  noticeId: string,
): Promise<void> => {
  await deleteDoc(doc(db, 'boards', uid, 'notice', noticeId));
};
