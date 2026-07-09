/**
 * @role: features — 자유게시판 게시글 생성 API
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/firebase/firebase';

export const createBoardApi = async (
  uid: string,
  author: string,
  title: string,
  content: string,
  views: number,
  likes: number,
  tags: string[] = [],
): Promise<string | undefined> => {
  const boardCollectionRef = collection(db, 'boards', uid, 'board');
  try {
    const docRef = await addDoc(boardCollectionRef, {
      author,
      title,
      content,
      views,
      likes,
      tags,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('[createBoardApi]', error);
  }
};
