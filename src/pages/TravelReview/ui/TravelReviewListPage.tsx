/**
 * @role: pages — 여행지별 후기 게시판 목록 + 후기 작성 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backward from '@/assets/icons/backward.png';
import { useDestinationRatings } from '@/features/TravelReview/hooks/useDestinationRatings';
import { useCreateTravelReview } from '@/features/TravelReview/hooks/useCreateTravelReview';
import { useSearchTravelReviews } from '@/features/TravelReview/hooks/useSearchTravelReviews';
import { getAllStations } from '@/shared/lib/trainRoutes';

const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-2xl ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </button>
    ))}
  </div>
);

const TravelReviewListPage = () => {
  const navigate = useNavigate();
  const { summaries, isLoaded } = useDestinationRatings();
  const allStations = getAllStations();

  const [showForm, setShowForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { createReview } = useCreateTravelReview(selectedCity);

  // 후기가 있는 역들만 검색 대상으로
  const citiesWithReviews = useMemo(
    () => summaries.filter((s) => s.reviewCount > 0).map((s) => s.city),
    [summaries],
  );

  const { results: searchResults, isSearching } = useSearchTravelReviews(
    searchQuery,
    citiesWithReviews,
  );

  const handleSubmit = async () => {
    if (!selectedCity || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    await createReview(title.trim(), content.trim(), rating);
    setSelectedCity('');
    setTitle('');
    setContent('');
    setRating(5);
    setShowForm(false);
    setSubmitting(false);
    navigate(0);
  };

  const isSearchMode = searchQuery.trim().length > 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100">
      {/* 헤더 */}
      <div className="flex w-full items-center justify-between bg-gray-100 px-[28px] py-4">
        <div className="flex items-center gap-4">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <h1 className="text-lg font-bold">여행지 후기</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-blue px-3 py-1.5 text-xs font-bold text-white"
        >
          {showForm ? '취소' : '후기 작성'}
        </button>
      </div>

      {/* 검색 바 */}
      {!showForm && (
        <div className="px-4 pb-3">
          <input
            className="w-full rounded-2xl bg-white px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-gray-400"
            placeholder="역 이름 또는 게시물 내용으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* 작성 폼 */}
      {showForm && (
        <div className="mx-4 mb-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-bold text-gray-500">역 선택</p>
          <div className="mb-3 flex max-h-[120px] flex-wrap gap-2 overflow-y-auto">
            {allStations.map((station) => (
              <button
                key={station}
                type="button"
                onClick={() => setSelectedCity(station)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  selectedCity === station
                    ? 'bg-blue text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {station}
              </button>
            ))}
          </div>
          <p className="mb-1 text-xs font-bold text-gray-500">별점</p>
          <StarPicker value={rating} onChange={setRating} />
          <input
            className="mt-3 w-full rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="mt-2 w-full rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none"
            placeholder="내용을 입력하세요"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedCity}
            className="mt-3 w-full rounded-xl bg-blue py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '등록'}
          </button>
        </div>
      )}

      {/* 검색 결과 */}
      {isSearchMode && (
        <div className="flex flex-col gap-3 px-4 pb-6">
          {isSearching && (
            <div className="flex h-16 items-center justify-center text-sm text-gray-400">
              검색 중...
            </div>
          )}
          {!isSearching && searchResults.length === 0 && (
            <div className="flex h-16 items-center justify-center rounded-2xl bg-white text-sm text-gray-400 shadow-sm">
              검색 결과가 없습니다.
            </div>
          )}
          {!isSearching &&
            searchResults.map((item) => (
              <div
                key={`${item.city}-${item.reviewId}`}
                onClick={() =>
                  navigate('/travel/review', { state: { city: item.city } })
                }
                className="flex cursor-pointer flex-col gap-1 rounded-2xl bg-white p-4 shadow-sm active:brightness-95"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue/10 px-2 py-0.5 text-xs font-bold text-blue">
                    {item.city}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-xs ${star <= item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-800">{item.title}</p>
                <p className="line-clamp-2 text-xs text-gray-500">
                  {item.content}
                </p>
                <span className="text-[10px] text-gray-400">{item.author}</span>
              </div>
            ))}
        </div>
      )}

      {/* 여행지 목록 (검색 모드 아닐 때) */}
      {!isSearchMode && (
        <div className="flex flex-col gap-3 px-4 pb-6">
          {!isLoaded &&
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          {isLoaded && citiesWithReviews.length === 0 && (
            <div className="flex h-20 items-center justify-center rounded-2xl bg-white text-sm text-gray-400 shadow-sm">
              아직 작성된 후기가 없습니다.
            </div>
          )}
          {isLoaded &&
            summaries
              .filter((s) => s.reviewCount > 0)
              .map(({ city, averageRating, reviewCount }) => (
                <div
                  key={city}
                  onClick={() =>
                    navigate('/travel/review', { state: { city } })
                  }
                  className="flex cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 shadow-sm active:brightness-95"
                >
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-bold text-gray-800">
                      {city}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-xs ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-1 text-[10px] text-gray-400">
                        {averageRating > 0 ? averageRating.toFixed(1) : '-'}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    후기 {reviewCount}개
                  </span>
                </div>
              ))}
        </div>
      )}
    </div>
  );
};

export default TravelReviewListPage;
