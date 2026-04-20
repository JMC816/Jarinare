import ReserveTitle from './ReserveTitle';

const DESTINATIONS = [
  {
    city: '부산',
    desc: '해운대·광안리 바다',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
    emoji: '🌊',
  },
  {
    city: '경주',
    desc: '천년고도 역사 여행',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    emoji: '🏯',
  },
  {
    city: '전주',
    desc: '한옥마을·한식 맛집',
    gradient: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
    emoji: '🍜',
  },
  {
    city: '강릉',
    desc: '동해 바다·커피 거리',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    emoji: '☕',
  },
  {
    city: '여수',
    desc: '낭만 항구 야경',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    emoji: '🌅',
  },
  {
    city: '춘천',
    desc: '닭갈비·소양강 댐',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
    emoji: '🍗',
  },
];

const RecommendDestination = () => {
  return (
    <>
      <ReserveTitle text="추천 여행지" showMore={false} />
      <div className="mb-4 grid w-full grid-cols-3 gap-3">
        {DESTINATIONS.map(({ city, desc, gradient, emoji }) => (
          <div
            key={city}
            className="flex flex-col justify-between rounded-2xl p-3 shadow-sm"
            style={{ background: gradient, height: '120px' }}
          >
            <span className="text-xl">{emoji}</span>
            <div className="flex flex-col gap-y-0.5">
              <span className="text-sm font-bold text-white">{city}</span>
              <span className="text-[10px] font-medium leading-tight text-white/80">
                {desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RecommendDestination;
