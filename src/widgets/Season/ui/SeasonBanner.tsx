/**
 * @role: widgets — 계절 할인 배너 UI
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { useState } from 'react';
import { useCurrentSeason } from '@/features/Season/hooks/useCurrentSeason';
import SeasonModal from './SeasonModal';

const SeasonBanner = () => {
  const { season, stations, style } = useCurrentSeason();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`mt-4 w-full rounded-2xl ${style.bg} px-4 py-3 text-left shadow-sm active:brightness-95`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{style.emoji}</span>
            <div>
              <p className={`text-sm font-bold ${style.color}`}>
                {season} 여행 특별 할인
              </p>
              <p className="text-xs text-gray-500">
                {season} 추천 역 선택 시 10% 할인
              </p>
            </div>
          </div>
          <div
            className={`flex items-center rounded-full ${style.bg} border ${style.badgeBorder} px-2.5 py-1.5`}
          >
            <span className={`text-xs font-bold ${style.color}`}>
              {stations.length}개 역
            </span>
          </div>
        </div>
      </button>

      {open && <SeasonModal onClose={() => setOpen(false)} />}
    </>
  );
};

export default SeasonBanner;
