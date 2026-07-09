/**
 * @role: features — 공지사항 게시글 생성 API
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/firebase/firebase';

export const createNoticeApi = async (
  uid: string,
  author: string,
  title: string,
  content: string,
  views: number,
  likes: number,
): Promise<string | undefined> => {
  const noticeCollectionRef = collection(db, 'boards', uid, 'notice');
  try {
    const docRef = await addDoc(noticeCollectionRef, {
      author,
      title,
      content,
      views,
      likes,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('[createNoticeApi]', error);
  }
};
