const AcceptModal = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <div className="flex w-[220px] flex-col items-center rounded-3xl bg-white px-6 py-8 shadow-xl">
        {/* 체크 아이콘 애니메이션 */}
        <div className="animate-bounce-in">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" fill="#E7F2FD" />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#0062FF"
              strokeWidth="3"
              strokeDasharray="176"
              strokeDashoffset="176"
              style={{ animation: 'draw-circle 0.5s ease-out forwards' }}
            />
            <polyline
              points="20,33 28,41 44,24"
              stroke="#0062FF"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="36"
              strokeDashoffset="36"
              style={{ animation: 'draw-check 0.4s ease-out 0.3s forwards' }}
            />
          </svg>
        </div>

        <span className="animate-fade-up mt-4 text-base font-bold text-gray-800">
          자리가 변경되었습니다!
        </span>

        <style>{`
          @keyframes draw-circle {
            from { stroke-dashoffset: 176; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes draw-check {
            from { stroke-dashoffset: 36; }
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AcceptModal;
