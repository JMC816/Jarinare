/**
 * @role: widgets — ui
 * @rule: 렌더링만 담당, centered prop으로 PC/모바일 스타일 분기
 */
const ExpiredModal = ({ centered = false }: { centered?: boolean }) => {
  const cardClass = centered
    ? 'w-[440px] animate-fade-up rounded-2xl bg-white px-8 pb-8 pt-5 shadow-2xl'
    : 'flex w-[220px] flex-col items-center rounded-3xl bg-white px-6 py-8 shadow-xl';

  return (
    <div
      className={`flex h-full w-full items-center justify-center ${centered ? 'bg-black/40 backdrop-blur-sm' : 'bg-darkGray/50'}`}
    >
      <div className={cardClass}>
        {centered && (
          <p className="mb-6 text-lg font-bold text-gray-900">만료된 요청</p>
        )}

        <div className={`flex flex-col items-center ${centered ? 'gap-4' : ''}`}>
          <div className="animate-bounce-in">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" fill="#FEE1DF" />
              <line x1="22" y1="22" x2="42" y2="42" stroke="#EA4335" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="42" y1="22" x2="22" y2="42" stroke="#EA4335" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>

          <span
            className={`animate-fade-up font-bold text-gray-800 ${centered ? 'text-base' : 'mt-4 text-base'}`}
          >
            이미 만료된 좌석입니다.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpiredModal;
