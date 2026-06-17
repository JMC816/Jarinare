/**
 * @role: widgets — PC 추천여행지 상세 모달 UI
 * @rule: 렌더링만 담당, createPortal로 전체 화면 오버레이
 */
import { createPortal } from 'react-dom';
import type { DestinationItem } from '../types/RecommendDestinationType';
import {
  CITY_HIGHLIGHTS,
  CITY_ROUTES,
} from '../constants/PCDestinationConstants';

interface Props {
  destination: DestinationItem;
  onClose: () => void;
}

const PCDestinationModal = ({ destination, onClose }: Props) => {
  const { city, desc, image, gradient } = destination;
  const highlights = CITY_HIGHLIGHTS[city] ?? [];
  const routes = CITY_ROUTES[city] ?? [];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 배경 이미지 */}
        <div
          className="relative h-56 shrink-0"
          style={{
            backgroundImage: image
              ? `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.55)), url(${image})`
              : `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.55)), ${gradient}`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/30"
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
            <p className="text-2xl font-black text-white">{city}</p>
            <p className="mt-0.5 text-sm text-white/80">{desc}</p>
          </div>
        </div>

        {/* 스크롤 가능한 내용 */}
        <div className="flex-1 overflow-y-auto">
          {/* 추천 여행지 */}
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="mb-4 flex items-center gap-2">
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
            <div className="grid grid-cols-2 gap-3">
              {highlights.map(({ emoji, title, desc: hdesc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-xl bg-gray-50 p-3"
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                      {hdesc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 루트 */}
          <div className="px-6 py-5">
            <div className="mb-4 flex items-center gap-2">
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
                {city}으로 가는 루트
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              {routes.map(({ from, to, time, fare, train }) => (
                <div
                  key={`${from}-${to}`}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-lightBlue px-2 py-0.5 text-xs font-bold text-blue">
                      {train}
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {from}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d1d5db"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                    <span className="text-sm font-bold text-gray-800">
                      {to}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-gray-700">
                      {time}
                    </span>
                    <span className="text-xs text-gray-400">{fare}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-gray-400">
              * 요금은 평일 기준 예시이며 실제 발권 시 달라질 수 있습니다.
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="shrink-0 border-t border-gray-100 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-blue py-3 text-sm font-bold text-white transition-colors hover:bg-blue/90"
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PCDestinationModal;
