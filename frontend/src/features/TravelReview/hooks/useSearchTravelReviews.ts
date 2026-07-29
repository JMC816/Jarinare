/**
 * @role: features — 여행지 후기 검색 (역 이름 + 게시물 내용)
 * @rule: Firestore 읽기만 담당, UI 로직 포함 금지
 */
import { db } from '@/shared/firebase/firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface SearchResultItem {
  city: string;
  reviewId: string;
  title: string;
  content: string;
  author: string;
  rating: number;
  createdAt: number;
}

export const useSearchTravelReviews = (query: string, cities: string[]) => {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setIsSearching(true);
      const lower = query.trim().toLowerCase();

      // 역 이름 매칭 도시들의 게시물 + 내용 매칭 게시물 모두 수집
      const matched: SearchResultItem[] = [];

      await Promise.all(
        cities.map(async (city) => {
          const cityMatches = city.toLowerCase().includes(lower);
          const snap = await getDocs(
            collection(db, 'travelReviews', city, 'posts'),
          );

          snap.docs.forEach((doc) => {
            const d = doc.data();
            const ts: Timestamp = d.createdAt;
            const createdAt =
              typeof ts?.seconds === 'number'
                ? ts.seconds
                : typeof ts?.toMillis === 'function'
                  ? Math.floor(ts.toMillis() / 1000)
                  : 0;

            const contentMatches =
              d.title?.toLowerCase().includes(lower) ||
              d.content?.toLowerCase().includes(lower);

            if (cityMatches || contentMatches) {
              matched.push({
                city,
                reviewId: doc.id,
                title: d.title,
                content: d.content,
                author: d.author,
                rating: d.rating,
                createdAt,
              });
            }
          });
        }),
      );

      matched.sort((a, b) => b.createdAt - a.createdAt);
      setResults(matched);
      setIsSearching(false);
    };

    search();
  }, [query, cities]);

  return { results, isSearching };
};
