/**
 * @role: widgets — 추천 여행지 UI 컴포넌트
 * @rule: 데이터 가공 금지, 전달받은 hook 결과만 렌더링
 */
import ReserveTitle from './ReserveTitle';
import { useRecommendDestination } from '../hooks/useRecommendDestination';
import { CITY_HIGHLIGHTS } from '../constants/PCDestinationConstants';

const RecommendDestination = () => {
  const {
    selected,
    setSelected,
    detailCity,
    filtered,
    handleCardClick,
    categories,
  } = useRecommendDestination();

  return (
    <div className="flex h-full flex-col">
      {/* 제목 + 카테고리 — 고정 영역 */}
      <div className="shrink-0">
        <ReserveTitle text="추천 여행지" showMore={false} />
        <div className="mb-3 flex w-full gap-x-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                selected === cat
                  ? 'bg-blue text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* 여행지 그리드 */}
        <div className="mb-3 grid w-full grid-cols-3 gap-3 p-1">
          {filtered.map(({ city, desc, gradient, emoji, image }) => (
            <div
              key={city}
              className="relative flex flex-col justify-between rounded-xl p-3 shadow-sm active:brightness-90"
              style={{
                backgroundImage: image
                  ? `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.6)), url(${image})`
                  : `linear-gradient(135deg, ${gradient}, ${gradient}cc)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '120px',
                cursor: 'pointer',
                transform: detailCity === city ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.2s ease',
              }}
              onClick={() => handleCardClick(city)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{emoji}</span>
                {detailCity === city && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                    <span className="text-[10px] font-black text-blue">✓</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-y-0.5">
                <span className="text-sm font-bold text-white">{city}</span>
                <span className="text-[10px] font-medium leading-tight text-white/80">
                  {desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 여행지 특징 카드 */}
        {detailCity && (CITY_HIGHLIGHTS[detailCity] ?? []).length > 0 && (
          <div className="mb-4 w-full rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2">
              {(CITY_HIGHLIGHTS[detailCity] ?? []).map(({ emoji, title, desc: hdesc }) => (
                <div key={title} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                  <span className="text-xl">{emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{hdesc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendDestination;
