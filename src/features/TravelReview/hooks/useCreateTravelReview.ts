/**
 * @role: features — 여행지 후기 작성
 * @rule: Firestore 쓰기만 담당, UI 로직 포함 금지
 */
import { db, auth } from '@/shared/firebase/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export const useCreateTravelReview = (destination: string) => {
  const createReview = async (
    title: string,
    content: string,
    rating: number,
  ) => {
    const user = auth.currentUser;
    const ref = collection(db, 'travelReviews', destination, 'posts');
    await addDoc(ref, {
      author: user?.displayName ?? '익명',
      title,
      content,
      rating,
      createdAt: serverTimestamp(),
    });
  };

  return { createReview };
};
