/**
 * @role: features — 특정 여행지의 후기 목록 조회
 * @rule: Firestore 읽기·Supabase 이미지 조회만 담당, UI 로직 포함 금지
 */
import { TravelReview } from '@/entities/TravelReview/types/travelReviewType';
import { db } from '@/shared/firebase/firebase';
import supabase from '@/shared/supabase/supabase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useGetTravelReviews = (destination: string) => {
  const [reviews, setReviews] = useState<TravelReview[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!destination) return;

    const fetch = async () => {
      const ref = collection(db, 'travelReviews', destination, 'posts');
      const q = query(ref, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);

      const data: TravelReview[] = await Promise.all(
        snap.docs.map(async (doc) => {
          const d = doc.data();

          const parseTs = (ts: Timestamp) =>
            typeof ts?.seconds === 'number'
              ? ts.seconds
              : typeof ts?.toMillis === 'function'
                ? Math.floor(ts.toMillis() / 1000)
                : 0;

          // Supabase에서 이미지 조회
          const { data: files } = await supabase.storage
            .from('jarinare-images')
            .list(`travel-review/${doc.id}`);

          let imageUrl: string | null = null;
          if (files && files.length > 0) {
            const { data: urlData } = supabase.storage
              .from('jarinare-images')
              .getPublicUrl(`travel-review/${doc.id}/${files[0].name}`);
            imageUrl = urlData.publicUrl;
          }

          return {
            id: doc.id,
            author: d.author,
            title: d.title,
            content: d.content,
            rating: d.rating,
            createdAt: parseTs(d.createdAt),
            updatedAt: d.updatedAt ? parseTs(d.updatedAt) : undefined,
            imageUrl,
          };
        }),
      );

      setReviews(data);
      setIsLoaded(true);
    };

    fetch();
  }, [destination]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return { reviews, isLoaded, averageRating };
};
