import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { seatsStateStore } from '@/features/TicketReserve/model/seatsStateStore';
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { ref, get, remove } from 'firebase/database';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/ReserveStore';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import SeatCheckList from '@/widgets/TicketReserve/ui/SeatCheckList';
import SeatCheckMenu from '@/widgets/TicketReserve/ui/SeatCheckMenu';
import SeatCheckState from '@/widgets/TicketReserve/ui/SeatCheckState';
import PCSeatCheckPage from './PCSeatCheckPage';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SeatCheckPage = () => {
  const { isShow, modalType, openModal } = useModalStore();
  const navigate = useNavigate();
  const { handleAllSelect, seatsStateCount, isLocksLoaded } =
    useSeatQueryData();
  const {
    selectKid,
    selectAdult,
    startDay,
    selectStartTime,
    selectTrainType,
    startStationForView,
    endStationForView,
    trainNo,
  } = trainDataStore();
  const { setSeatsState } = seatsStateStore();

  const docIds = `${startDay}_${selectStartTime}_${selectTrainType}_${startStationForView}_${endStationForView}`;

  // 페이지 떠날 때 좌석 선택 초기화 + 잠금 해제
  useEffect(() => {
    return () => {
      const user = auth.currentUser;
      if (!user) return;

      // 로컬 선택 상태 초기화
      setSeatsState({});

      // 실시간 DB 잠금 해제
      const locksPath = `locks/${docIds}/${trainNo}`;
      const locksRef = ref(realtimeDb, locksPath);
      get(locksRef).then((snapshot) => {
        if (!snapshot.exists()) return;
        const locks = snapshot.val() as Record<string, string>;
        const myLockedSeats = Object.entries(locks)
          .filter(([, uid]) => uid === user.uid)
          .map(([seatId]) => seatId);
        myLockedSeats.forEach((seatId) =>
          remove(ref(realtimeDb, `${locksPath}/${seatId}`)),
        );
      });
    };
  }, []);

  // 좌석 전체를 선택하지 않으면 false
  // 좌석을 전체 선택하면 true
  // 전체보다 적게 선택하면 false
  const isLoggedIn = !!auth.currentUser;

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
      <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 pl-[28px] pr-[27px] lg:hidden">
        <BackWardPageButton title="좌석 선택" />
        <div className="mt-4 w-full overflow-hidden rounded-2xl bg-white px-4 py-4 shadow-sm">
          <SeatCheckMenu />
          <SeatCheckList />
          <SeatCheckState />
        </div>
        <div className="mt-4 flex w-full gap-3">
          <button
            onClick={isLocksLoaded && isAllLocked ? undefined : handleAllSelect}
            className={`flex-1 rounded-2xl py-3.5 text-base font-bold text-white transition-colors ${
              isLocksLoaded && isAllLocked
                ? 'bg-gray-300'
                : 'bg-blue active:brightness-95'
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
            className={`flex-[2] rounded-2xl py-3.5 text-base font-bold text-white transition-colors ${
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

      {/* 공통 모달 */}
      {isShow == false || modalType == undefined ? null : <Modal />}
    </>
  );
};

export default SeatCheckPage;
