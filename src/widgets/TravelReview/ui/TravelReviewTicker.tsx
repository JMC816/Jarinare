/**
 * @role: widgets — 여행지 후기 Ticker UI
 * @rule: 렌더링만 담당, 데이터 가공 금지
 */
import { useNavigate } from 'react-router-dom';
import { useDestinationRatings } from '@/features/TravelReview/hooks/useDestinationRatings';
import { useTravelReviewTicker } from '../hooks/useTravelReviewTicker';
import StarRating from '@/shared/ui/StarRating';

// 슬라이더 div = 200%, 카드 10장 × 10% = 100%, translateX(-50%) = 컨테이너 1폭 이동 후 루프
const CARD_HEIGHT = 200;

const TravelReviewTicker = ({ title = '여행지 후기' }: { title?: string }) => {
  const navigate = useNavigate();
  const { summaries, isLoaded } = useDestinationRatings();
  const { tickerItems, loopItems } = useTravelReviewTicker(summaries);

  if (!isLoaded) {
    return (
      <div className="py-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border-x-[6px] border-gray-50 bg-white"
              style={{ width: '20%', height: CARD_HEIGHT }}
            >
              <div
                className="animate-pulse bg-gray-200"
                style={{ height: '66.67%' }}
              />
              <div
                className="flex flex-col justify-center gap-2 px-3"
                style={{ height: '33.33%' }}
              >
                <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tickerItems.length === 0) {
    return (
      <div className="py-2">
        <div className="mb-2 flex items-center justify-between">
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
          className="flex cursor-pointer items-center justify-center bg-white shadow-sm"
          style={{ height: CARD_HEIGHT }}
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
          className="flex"
          style={{
            width: '200%',
            animation: 'ticker-loop 30s linear infinite',
            willChange: 'transform',
          }}
        >
          {loopItems.map(({ city, averageRating, reviewCount }, idx) =>
            reviewCount === -1 ? (
              <div
                key={`${city}-${idx}`}
                onClick={() => navigate('/travel/review/list')}
                className="shrink-0 cursor-pointer overflow-hidden rounded-2xl border-x-[6px] border-gray-50 bg-white active:brightness-90"
                style={{ width: '10%', height: CARD_HEIGHT }}
              >
                {/* 상단 2/3 — 이미지 플레이스홀더 */}
                <div
                  className="flex flex-col items-center justify-center gap-1 bg-gray-100"
                  style={{ height: '66.67%' }}
                >
                  <span className="text-2xl">✍️</span>
                  <span className="text-[10px] text-gray-400">
                    후기를 작성해보세요
                  </span>
                </div>
                {/* 하단 1/3 */}
                <div
                  className="flex flex-col justify-center px-3"
                  style={{ height: '33.33%' }}
                />
              </div>
            ) : (
              <div
                key={`${city}-${idx}`}
                onClick={() => navigate('/travel/review', { state: { city } })}
                className="shrink-0 cursor-pointer overflow-hidden rounded-2xl border-x-[6px] border-gray-50 bg-white active:brightness-90"
                style={{ width: '10%', height: CARD_HEIGHT }}
              >
                {/* 상단 2/3 — 이미지 영역 */}
                <div
                  className="relative flex items-center justify-center overflow-hidden bg-gray-100"
                  style={{ height: '66.67%' }}
                >
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>

                {/* 하단 1/3 — 정보 영역 */}
                <div
                  className="flex flex-col justify-center gap-1 px-3"
                  style={{ height: '33.33%' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate text-base font-bold text-gray-800">
                      {city}
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5 rounded-md bg-yellow-50 px-1.5 py-0.5 text-xs font-bold">
                      <svg
                        width="10"
                        height="10"
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
                  <div className="flex items-center justify-between">
                    <StarRating rating={averageRating} />
                    <span className="text-xs text-gray-400">
                      후기 {reviewCount}개
                    </span>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <style>{`
        @keyframes ticker-loop {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default TravelReviewTicker;
