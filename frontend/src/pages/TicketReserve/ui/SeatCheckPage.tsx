import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { seatsStateStore } from '@/features/TicketReserve/model/seatsStateStore';
import { releaseHolds } from '@/features/TicketReserve/api/reservationApi';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/ReserveStore';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import SeatCheckList from '@/widgets/TicketReserve/ui/SeatCheckList';
import SeatCheckMenu from '@/widgets/TicketReserve/ui/SeatCheckMenu';
import SeatCheckState from '@/widgets/TicketReserve/ui/SeatCheckState';
import PCSeatCheckPage from './PCSeatCheckPage';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

const SeatCheckPage = () => {
  const { isShow, modalType, openModal } = useModalStore();
  const { isLoggedIn } = useCurrentUser();
  const navigate = useNavigate();
  const { handleAllSelect, seatsStateCount, isLocksLoaded } =
    useSeatQueryData();
  const { selectKid, selectAdult, trainTypeForView, startStationForView, endStationForView } = trainDataStore();
  const { setSeatsState } = seatsStateStore();

  // 페이지 떠날 때 로컬 좌석 선택 초기화 + 선점 즉시 해제
  useEffect(() => {
    return () => {
      setSeatsState({});
      const { tripId, trainNo } = trainDataStore.getState();
      if (tripId) releaseHolds(tripId, Number(trainNo) || undefined).catch(() => {});
    };
  }, []);

  // 좌석 전체를 선택하지 않으면 false
  // 좌석을 전체 선택하면 true
  // 전체보다 적게 선택하면 false

  const isAllSelected =
    seatsStateCount === 0 ? false : seatsStateCount === selectKid + selectAdult;

  // 좌석 전체를 선택하지 않으면 false
  // 좌석을 전체 선택하면 false
  // 전체보다 적게 선택하면 true
  const isAllLocked =
    seatsStateCount === 0 ? false : seatsStateCount <= selectKid + selectAdult;

  return (
    <>
      {/* PC 버전 */}
      <div className="hidden w-full lg:block">
        <PCSeatCheckPage />
      </div>

      {/* 모바일 버전 */}
      <div className="flex min-h-screen w-full min-w-[375px] flex-col items-center overflow-y-auto bg-gray-50 pb-4 pl-[28px] pr-[27px] lg:hidden">
        <BackWardPageButton title="좌석 선택" />

        {/* 타이틀 */}
        <div className="mt-3 w-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-gray-400">TRAIN SELECTION</span>
            <SeatCheckMenu />
          </div>
          <p className="mt-0.5 text-lg font-bold text-gray-900">{trainTypeForView}</p>
          <p className="text-xs text-gray-400">{startStationForView} → {endStationForView}</p>
        </div>

        {/* 좌석 카드 */}
        <div className="mt-3 w-full overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* 범례 헤더 */}
          <div className="flex items-center justify-center border-b border-gray-100 bg-gray-50/50 px-4 py-3">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-blue" />
                <span className="text-xs font-semibold text-gray-600">선택됨</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-lightGray" />
                <span className="text-xs font-semibold text-gray-600">이용 불가</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full border border-lightGray bg-white" />
                <span className="text-xs font-semibold text-gray-600">이용 가능</span>
              </div>
            </div>
          </div>
          <div className="px-4 py-4">
            <SeatCheckList />
          </div>
        </div>

        {/* 하단 버튼 카드 */}
        <div className="mt-4 w-full overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold tracking-widest text-gray-400">SELECTED SEATS</span>
              <span className="text-lg font-bold text-blue">
                {seatsStateCount}
                <span className="ml-1 text-xs font-normal text-gray-400">/ {selectKid + selectAdult} Seats</span>
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={isLocksLoaded && isAllLocked ? undefined : handleAllSelect}
                className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors ${
                  isLocksLoaded && isAllLocked
                    ? 'border-gray-200 bg-white text-gray-300'
                    : 'border-blue bg-white text-blue active:brightness-95'
                }`}
              >
                자동 선택
              </button>
              <button
                onClick={
                  isAllSelected
                    ? isLoggedIn
                      ? () => openModal('PayModal')
                      : () => navigate('/auth/login')
                    : undefined
                }
                className={`rounded-xl px-6 py-2.5 text-xs font-bold text-white transition-colors ${
                  isAllSelected ? 'bg-blue active:brightness-95' : 'bg-gray-300'
                }`}
              >
                {isAllSelected
                  ? isLoggedIn
                    ? '예매'
                    : '로그인하기'
                  : `${seatsStateCount} / ${selectKid + selectAdult} 선택`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 공통 모달 */}
      {isShow == false || modalType == undefined ? null : <Modal />}
    </>
  );
};

export default SeatCheckPage;
