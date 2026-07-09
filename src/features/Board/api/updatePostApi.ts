/**
 * @role: features/api — 게시물 수정
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { db } from '@/shared/firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const updatePostApi = async (
  postPath: string,
  data: { title: string; content: string },
): Promise<void> => {
  const parts = postPath.split('/');
  await updateDoc(doc(db, parts[0], parts[1], parts[2], parts[3]), data);
};
