import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/ReserveStore';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import SeatCheckList from '@/widgets/TicketReserve/ui/SeatCheckList';
import SeatCheckMenu from '@/widgets/TicketReserve/ui/SeatCheckMenu';
import SeatCheckState from '@/widgets/TicketReserve/ui/SeatCheckState';

const SeatCheckPage = () => {
  const { isShow, modalType, openModal } = useModalStore();
  const { handleAllSelect, seatsStateCount, isLocksLoaded } =
    useSeatQueryData();
  const { selectKid, selectAdult } = trainDataStore();

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
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 pl-[28px] pr-[27px]">
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
            isLocksLoaded && isAllLocked ? 'bg-gray-300' : 'bg-blue active:brightness-95'
          }`}
        >
          자동 선택
        </button>
        <button
          onClick={isAllSelected ? () => openModal('PayModal') : undefined}
          className={`flex-[2] rounded-2xl py-3.5 text-base font-bold text-white transition-colors ${
            isAllSelected ? 'bg-blue active:brightness-95' : 'bg-gray-300'
          }`}
        >
          {isAllSelected ? '예매' : `${seatsStateCount} / ${selectKid + selectAdult} 선택`}
        </button>
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default SeatCheckPage;
