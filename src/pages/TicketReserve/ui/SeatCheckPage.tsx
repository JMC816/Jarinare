import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '@/widgets/model/ReserveStore';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import SeatCheckButton from '@/widgets/TicketReserve/ui/SeatCheckButton';
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
    <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
      <SeatCheckMenu />
      <SeatCheckList />
      <SeatCheckState />
      <div className="mt-[10px] flex justify-between gap-x-5">
        <SeatCheckButton
          onClick={isLocksLoaded && isAllLocked ? null : handleAllSelect}
          text="자동 좌석 선택"
          textColor="white"
          bgColor={
            isLocksLoaded && isAllLocked ? 'lightBlueImpossible' : 'blue'
          }
        />
        <SeatCheckButton
          onClick={isAllSelected ? () => openModal('PayModal') : null}
          text={
            isAllSelected
              ? '예매'
              : `${seatsStateCount} / ${selectKid + selectAdult} 선택`
          }
          textColor="white"
          bgColor={isAllSelected ? 'blue' : 'lightBlueImpossible'}
        />
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default SeatCheckPage;
