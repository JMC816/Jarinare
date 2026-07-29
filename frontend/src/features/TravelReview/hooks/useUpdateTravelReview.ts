/**
 * @role: features — 여행지 후기 수정
 * @rule: Firestore 쓰기만 담당, UI 로직 포함 금지
 */
import { db } from '@/shared/firebase/firebase';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';

export const useUpdateTravelReview = (destination: string) => {
  const updateReview = async (
    reviewId: string,
    title: string,
    content: string,
    rating: number,
  ) => {
    const ref = doc(db, 'travelReviews', destination, 'posts', reviewId);
    await updateDoc(ref, { title, content, rating, updatedAt: serverTimestamp() });
  };

  return { updateReview };
};
