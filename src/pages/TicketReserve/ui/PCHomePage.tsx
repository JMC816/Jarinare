/**
 * @role: pages — PC 홈 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import { errorStateStore } from '@/features/TicketReserve/model/errorStateStore';
import { DESTINATIONS } from '@/widgets/TicketReserve/constants/RecommendConstants';
import SeasonBanner from '@/widgets/Season/ui/SeasonBanner';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import ReserveTicket from '@/widgets/TicketReserve/ui/ReserveTicket';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import useModalStore from '@/widgets/model/ReserveStore';
import { useNavigate } from 'react-router-dom';
import start_station from '@/assets/icons/start_station.png';
import end_station from '@/assets/icons/end_station.png';
import calendar from '@/assets/icons/calendar.png';
import on_user from '@/assets/icons/on_user.png';

interface PCHomePageProps {
  hasNotification: boolean;
}

const PCHomePage = ({ hasNotification }: PCHomePageProps) => {
  const { isShow, modalType, openModal } = useModalStore();
  const {
    startStationForView,
    endStationForView,
    startDayForView,
    startStation,
    endStation,
    startDay,
    adult,
    kid,
  } = trainDataStore();
  const { refetch } = trainQueryData();
  const { error } = errorStateStore();
  const navigate = useNavigate();

  const handleSearch = () => {
    const canSearch =
      startStation && endStation && startDay && startStation !== endStation;
    const hasNetworkError = error === 'Network Error';

    if (canSearch && !hasNetworkError) {
      refetch();
      navigate('/reserve/trainCheck');
    } else if (canSearch && hasNetworkError) {
      openModal('ErrorModal');
    }
  };

  const isSearchDisabled =
    !startStationForView ||
    !endStationForView ||
    !startDayForView ||
    adult + kid === 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <PCTopNav hasNotification={hasNotification} />

      <div className="flex w-full flex-1 gap-0">
        <PCSidebar />

        <main className="relative min-w-0 flex-1 overflow-x-hidden">
          {/* 히어로 배경 */}
          <div className="absolute left-0 top-0 h-[480px] w-full overflow-hidden rounded-b-3xl">
            <div className="h-full w-full bg-gradient-to-br from-blue via-blue/80 to-lightBlue opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50" />
          </div>

          <div className="relative z-10 px-10 pb-16 pt-10">
            {/* 히어로 텍스트 */}
            <div className="mb-8 drop-shadow-sm">
              <h1 className="text-4xl font-black leading-tight tracking-tight text-white">
                여행의 시작,
                <br />
                여기서 찾으세요
              </h1>
              <p className="mt-2 text-base text-white/80">
                Where will your next journey take you?
              </p>
            </div>

            {/* 예약 위젯 */}
            <div className="mb-10 rounded-2xl border border-gray-200/50 bg-white/95 p-6 shadow-lg backdrop-blur-md">
              <div className="grid grid-cols-5 items-end gap-4">
                {/* 출발역 */}
                <button
                  onClick={() => openModal('StartPlaceModal')}
                  className="flex flex-col gap-1 text-left"
                >
                  <span className="text-xs font-medium text-gray-500">
                    출발역
                  </span>
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 transition-colors hover:border-blue">
                    <img width={16} height={16} src={start_station} />
                    <span
                      className={`text-sm font-semibold ${startStationForView ? 'text-black' : 'text-gray-400'}`}
                    >
                      {startStationForView || '출발역 선택'}
                    </span>
                  </div>
                </button>

                {/* 도착역 */}
                <button
                  onClick={() => openModal('EndPlaceModal')}
                  className="flex flex-col gap-1 text-left"
                >
                  <span className="text-xs font-medium text-gray-500">
                    도착역
                  </span>
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 transition-colors hover:border-blue">
                    <img width={16} height={16} src={end_station} />
                    <span
                      className={`text-sm font-semibold ${endStationForView ? 'text-black' : 'text-gray-400'}`}
                    >
                      {endStationForView || '도착역 선택'}
                    </span>
                  </div>
                </button>

                {/* 날짜 */}
                <button
                  onClick={() => openModal('DayModal')}
                  className="flex flex-col gap-1 text-left"
                >
                  <span className="text-xs font-medium text-gray-500">
                    가는날
                  </span>
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 transition-colors hover:border-blue">
                    <img width={16} height={16} src={calendar} />
                    <span
                      className={`text-sm font-semibold ${startDayForView ? 'text-black' : 'text-gray-400'}`}
                    >
                      {startDayForView || '날짜 선택'}
                    </span>
                  </div>
                </button>

                {/* 인원 */}
                <button
                  onClick={() => openModal('CountModal')}
                  className="flex flex-col gap-1 text-left"
                >
                  <span className="text-xs font-medium text-gray-500">
                    인원
                  </span>
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 transition-colors hover:border-blue">
                    <img width={16} height={16} src={on_user} />
                    <span
                      className={`text-sm font-semibold ${adult + kid > 0 ? 'text-black' : 'text-gray-400'}`}
                    >
                      {adult + kid > 0 ? `${adult + kid}명` : '인원 선택'}
                    </span>
                  </div>
                </button>

                {/* 검색 버튼 */}
                <button
                  onClick={handleSearch}
                  disabled={isSearchDisabled}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  승차권 검색
                </button>
              </div>
            </div>

            {/* 콘텐츠 그리드 */}
            <div className="grid grid-cols-12 gap-6">
              {/* 내 승차권 + 계절 배너 */}
              <div className="col-span-4 flex flex-col gap-5">
                <div>
                  <h2 className="mb-3 text-lg font-bold text-gray-900">
                    내 승차권
                  </h2>
                  <ReserveTicket />
                </div>
                <div>
                  <h2 className="mb-3 text-lg font-bold text-gray-900">
                    이벤트
                  </h2>
                  <SeasonBanner />
                </div>
              </div>

              {/* 추천 여행지 */}
              <div className="col-span-8 flex flex-col gap-3">
                <div className="flex items-end justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    추천 여행지
                  </h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {DESTINATIONS.map(({ city, desc, gradient, emoji }) => (
                    <div
                      key={city}
                      className="flex cursor-pointer flex-col justify-between rounded-2xl p-4 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: gradient, height: '140px' }}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-base font-bold text-white">
                          {city}
                        </span>
                        <span className="text-xs text-white/80">{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {isShow && modalType ? <Modal /> : null}
    </div>
  );
};

export default PCHomePage;
