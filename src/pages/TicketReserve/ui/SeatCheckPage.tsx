import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '@/widgets/model/ReserveStore';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import SeatCheckButton from '@/widgets/TicketReserve/ui/SeatCheckButton';
import SeatCheckList from '@/widgets/TicketReserve/ui/SeatCheckList';
import SeatCheckMenu from '@/widgets/TicketReserve/ui/SeatCheckMenu';
import SeatCheckState from '@/widgets/TicketReserve/ui/SeatCheckState';

const SeatCheckPage = () => {
  const { isShow, modalType } = useModalStore();
  const { createSelectedSeats, handleAllSelect, seatsStateCount } =
    useSeatQueryData();
  const { selectKid, selectAdult } = trainDataStore();

  const isAllSelected =
    seatsStateCount === 0 ? false : seatsStateCount === selectKid + selectAdult;

  return (
    <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
      <SeatCheckMenu />
      <SeatCheckList />
      <SeatCheckState />
      <div className="mt-[10px] flex justify-between gap-x-5">
        <SeatCheckButton
          onClick={handleAllSelect}
          text="자동 좌석 선택"
          textColor="white"
          bgColor="blue"
        />
        <SeatCheckButton
          onClick={isAllSelected ? createSelectedSeats : null}
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
