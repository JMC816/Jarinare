/**
 * @role: features — 여행지 후기 작성
 * @rule: Firestore 쓰기·Supabase 이미지 업로드만 담당, UI 로직 포함 금지
 */
import { db, auth } from '@/shared/firebase/firebase';
import supabase from '@/shared/supabase/supabase';
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

export const useCreateTravelReview = (destination: string) => {
  const createReview = async (
    title: string,
    content: string,
    rating: number,
    file?: File | null,
  ) => {
    const user = auth.currentUser;
    const ref = collection(db, 'travelReviews', destination, 'posts');

    const docRef = await addDoc(ref, {
      author: user?.displayName ?? '익명',
      title,
      content,
      rating,
      imageUrl: null,
      createdAt: serverTimestamp(),
    });

    if (file) {
      const filePath = `travel-review/${destination}/${docRef.id}/${file.name}`;
      const { error } = await supabase.storage
        .from('jarinare-images')
        .upload(filePath, file);

      if (!error) {
        const { data: urlData } = supabase.storage
          .from('jarinare-images')
          .getPublicUrl(filePath);
        await updateDoc(docRef, { imageUrl: urlData.publicUrl });
      }
    }
  };

  return { createReview };
};
