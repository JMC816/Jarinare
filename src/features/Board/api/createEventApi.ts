/**
 * @role: features — 이벤트 게시글 생성 API
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/firebase/firebase';

export const createEventApi = async (
  uid: string,
  author: string,
  title: string,
  content: string,
  views: number,
  likes: number,
): Promise<string | undefined> => {
  const eventCollectionRef = collection(db, 'boards', uid, 'event');
  try {
    const docRef = await addDoc(eventCollectionRef, {
      author,
      title,
      content,
      views,
      likes,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('[createEventApi]', error);
  }
};
