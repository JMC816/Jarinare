/**
 * @role: widgets — 여행지 후기 Ticker UI
 * @rule: 렌더링만 담당, 데이터 가공 금지
 */
import { useNavigate } from 'react-router-dom';
import { useDestinationRatings } from '@/features/TravelReview/hooks/useDestinationRatings';
import { useTravelReviewTicker } from '../hooks/useTravelReviewTicker';
import StarRating from '@/shared/ui/StarRating';

const TravelReviewTicker = () => {
  const navigate = useNavigate();
  const { summaries, isLoaded } = useDestinationRatings();
  const { tickerItems } = useTravelReviewTicker(summaries);

  if (!isLoaded) {
    return (
      <div className="px-4 py-2">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[100px] w-[140px] shrink-0 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (tickerItems.length === 0) {
    return (
      <div className="px-4 py-2">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-sm font-bold text-gray-800">여행지 후기</p>
          <button
            onClick={() => navigate('/travel/review/list')}
            className="text-xs text-blue underline"
          >
            더보기
          </button>
        </div>
        <div
          onClick={() => navigate('/travel/review/list')}
          className="flex h-[100px] cursor-pointer items-center justify-center rounded-2xl bg-white shadow-sm"
        >
          <p className="text-sm text-gray-400">
            첫 번째 여행지 후기를 작성해보세요 ✍️
          </p>
        </div>
      </div>
    );
  }

  // 4개 미만이면 빈 슬롯을 "작성 유도" 카드로 채움
  const TICKER_COUNT = 4;
  const emptyCount = TICKER_COUNT - tickerItems.length;
  const filledItems = [
    ...tickerItems,
    ...Array.from({ length: emptyCount }, (_, i) => ({
      city: `__empty_${i}` as const,
      averageRating: 0,
      reviewCount: -1,
    })),
  ];

  // 무한 반복을 위해 아이템 복제
  const loopItems = [...filledItems, ...filledItems];

  return (
    <div className="px-4 py-2">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-sm font-bold text-gray-800">여행지 후기</p>
        <button
          onClick={() => navigate('/travel/review/list')}
          className="text-xs text-blue underline"
        >
          더보기
        </button>
      </div>
      <div className="overflow-hidden">
        <div
          className="flex gap-3"
          style={{
            animation: `ticker ${tickerItems.length * 8}s linear infinite`,
            width: `max-content`,
          }}
        >
          {loopItems.map(({ city, averageRating, reviewCount }, idx) =>
            reviewCount === -1 ? (
              <div
                key={`${city}-${idx}`}
                onClick={() => navigate('/travel/review/list')}
                className="flex w-[140px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl bg-white p-3 shadow-sm active:brightness-90"
                style={{ height: '100px' }}
              >
                <span className="text-lg">✍️</span>
                <span className="mt-1 text-center text-[10px] text-gray-400">
                  후기를 작성해보세요
                </span>
              </div>
            ) : (
              <div
                key={`${city}-${idx}`}
                onClick={() => navigate('/travel/review', { state: { city } })}
                className="flex w-[140px] shrink-0 cursor-pointer flex-col justify-between rounded-2xl bg-white p-3 shadow-sm active:brightness-90"
                style={{ height: '100px' }}
              >
                <span className="text-[10px] font-bold text-gray-400">
                  후기 {reviewCount}개
                </span>
                <div className="flex flex-col gap-y-0.5">
                  <span className="text-sm font-bold text-gray-800">
                    {city}
                  </span>
                  <StarRating rating={averageRating} showValue />
                </div>
              </div>
            ),
          )}
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default TravelReviewTicker;
