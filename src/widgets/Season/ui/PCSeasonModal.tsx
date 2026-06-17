/**
 * @role: widgets — PC 계절 할인 모달 UI
 * @rule: 렌더링만 담당, fixed 오버레이로 전체 화면 덮음
 */
import { createPortal } from 'react-dom';
import { useCurrentSeason } from '@/features/Season/hooks/useCurrentSeason';
import busan from '@/assets/background/부산.png';

const ROUTE = ['서울', '대전', '동대구', '부산'];

interface Props {
  onClose: () => void;
}

const PCSeasonModal = ({ onClose }: Props) => {
  const { season, stations, style } = useCurrentSeason();

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 배경 이미지 */}
        <div
          className="relative h-56 shrink-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.55)), url(${busan})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              SPECIAL DISCOUNT
            </p>
            <p className="mt-0.5 text-2xl font-black text-white">
              {season} 특별 기차여행
            </p>
            <p className="text-sm text-white/80">할인 이벤트</p>
          </div>
        </div>

        {/* 스크롤 가능한 내용 */}
        <div className="flex-1 overflow-y-auto">
          {/* 추천 여행지 */}
          <div className="border-b border-gray-100 px-5 py-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-lightBlue">
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
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-800">추천 여행지</h3>
            </div>
            <p className="mb-3 text-xs text-gray-400">
              아래 역 선택 시 결제금액{' '}
              <span className="font-bold text-yellow-500">10% 즉시 할인</span>{' '}
              혜택을 드립니다.
            </p>
            <div className="flex flex-wrap gap-2">
              {stations.map((station) => (
                <span
                  key={station}
                  className={`rounded-full ${style.bg} px-3 py-1 text-xs font-bold ${style.color}`}
                >
                  {station}
                </span>
              ))}
            </div>
          </div>

          {/* 부산으로 가는 루트 */}
          <div className="px-5 py-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-lightBlue">
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
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M6 6V4M10 6V4M14 6V4M18 6V4" />
                  <path d="M6 18v2M10 18v2M14 18v2M18 18v2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M7 12h2M15 12h2" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-800">
                부산으로 가는 루트
              </h3>
            </div>
            <div className="flex flex-col gap-0">
              {ROUTE.map((station, i) => (
                <div key={station} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${i === ROUTE.length - 1 ? 'border-blue bg-blue' : 'border-blue bg-white'}`}
                    >
                      <span
                        className={`text-xs font-black ${i === ROUTE.length - 1 ? 'text-white' : 'text-blue'}`}
                      >
                        {i + 1}
                      </span>
                    </div>
                    {i < ROUTE.length - 1 && (
                      <div className="h-8 w-0.5 bg-blue/30" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-bold ${i === ROUTE.length - 1 ? 'text-blue' : 'text-gray-800'}`}
                    >
                      {station}
                    </span>
                    {i < ROUTE.length - 1 && (
                      <span className="text-xs text-gray-400">
                        {i === 0 ? 'KTX 출발' : i === 1 ? '약 50분' : '약 40분'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-gray-400">
              * 서울역 기준 부산역까지 약 2시간 30분 소요됩니다.
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="shrink-0 border-t border-gray-100 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PCSeasonModal;
