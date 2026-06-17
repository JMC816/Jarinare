/**
 * @role: widgets — 여행지 후기 Ticker UI
 * @rule: 렌더링만 담당, 데이터 가공 금지
 */
import { useNavigate } from 'react-router-dom';
import { useDestinationRatings } from '@/features/TravelReview/hooks/useDestinationRatings';
import { useTravelReviewTicker } from '../hooks/useTravelReviewTicker';
import StarRating from '@/shared/ui/StarRating';

const TravelReviewTicker = ({ title = '여행지 후기' }: { title?: string }) => {
  const navigate = useNavigate();
  const { summaries, isLoaded } = useDestinationRatings();
  const { tickerItems, loopItems } = useTravelReviewTicker(summaries);

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
              className="h-[100px] w-[220px] shrink-0 animate-pulse rounded-2xl bg-gray-200"
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
          <p className="text-sm font-bold text-gray-800">{title}</p>
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

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between pr-2">
        <div className="flex items-center gap-2">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-lg font-bold text-gray-800">{title}</p>
        </div>
        <button
          onClick={() => navigate('/travel/review/list')}
          className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600"
        >
          더보기
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <div className="overflow-hidden">
        <div
          className="flex gap-4"
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
                className="flex w-[220px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl bg-white p-3 shadow-sm active:brightness-90"
                style={{ height: '110px' }}
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
                className="flex w-[220px] shrink-0 cursor-pointer flex-col justify-between rounded-2xl bg-white px-4 py-3.5 shadow-sm active:brightness-90"
                style={{ height: '110px' }}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-400">
                    후기 {reviewCount}개
                  </span>
                  <span className="flex items-center gap-0.5 rounded-md bg-yellow-50 px-1.5 py-0.5 text-[9px] font-bold">
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="#eab308"
                      stroke="#eab308"
                      strokeWidth="1"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-gray-800">
                      {averageRating.toFixed(1)}
                    </span>
                  </span>
                </div>
                <div className="flex flex-col gap-y-1.5">
                  <span className="text-xl font-semibold text-gray-800">
                    {city}
                  </span>
                  <StarRating rating={averageRating} />
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
