/**
 * @role: features — 여행지 후기 삭제
 * @rule: Firestore 삭제만 담당, UI 로직 포함 금지
 */
import { db } from '@/shared/firebase/firebase';
import { deleteDoc, doc } from 'firebase/firestore';

export const useDeleteTravelReview = (destination: string) => {
  const deleteReview = async (reviewId: string) => {
    const ref = doc(db, 'travelReviews', destination, 'posts', reviewId);
    await deleteDoc(ref);
  };

  return { deleteReview };
};
