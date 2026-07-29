/**
 * @role: features — 전체 역의 평균 별점 조회 (Ticker 정렬용)
 * @rule: Firestore 읽기만 담당, UI 로직 포함 금지
 */
import { DestinationReviewSummary } from '@/entities/TravelReview/types/travelReviewType';
import { getAllStations } from '@/shared/lib/trainRoutes';
import { db } from '@/shared/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useDestinationRatings = () => {
  const [summaries, setSummaries] = useState<DestinationReviewSummary[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const stations = getAllStations();

      const results = await Promise.all(
        stations.map(async (city) => {
          const snap = await getDocs(
            collection(db, 'travelReviews', city, 'posts'),
          );
          const ratings = snap.docs.map(
            (d) => (d.data().rating as number) ?? 0,
          );
          const averageRating =
            ratings.length > 0
              ? ratings.reduce((s, r) => s + r, 0) / ratings.length
              : 0;

          return {
            city,
            averageRating,
            reviewCount: ratings.length,
          } as DestinationReviewSummary;
        }),
      );

      // 별점 내림차순, 동점이면 역 이름 오름차순
      results.sort((a, b) => {
        if (b.averageRating !== a.averageRating)
          return b.averageRating - a.averageRating;
        return a.city.localeCompare(b.city, 'ko');
      });

      setSummaries(results);
      setIsLoaded(true);
    };

    fetch();
  }, []);

  return { summaries, isLoaded };
};
