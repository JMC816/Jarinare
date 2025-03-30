import useModalStore from '@/shared/modals/model/ReserveStore';
import Modal from '@/widgets/modals/TicketReserve/ui/Modal';
import SeatCheckButton from '@/widgets/TicketReserve/ui/SeatCheckButton';
import SeatCheckList from '@/widgets/TicketReserve/ui/SeatCheckList';
import SeatCheckMenu from '@/widgets/TicketReserve/ui/SeatCheckMenu';
import SeatCheckState from '@/widgets/TicketReserve/ui/SeatCheckState';

const SeatCheckPage = () => {
  const { isShow, modalType } = useModalStore();
  return (
    <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
      <SeatCheckMenu />
      <SeatCheckList />
      <SeatCheckState />
      <div className="mt-[10px] flex justify-between gap-x-5">
        <SeatCheckButton
          text="자동 좌석 선택"
          textColor="white"
          bgColor="blue"
        />
        <SeatCheckButton
          text="0 / 2 선택"
          textColor="white"
          bgColor="lightBlueImpossible"
        />
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default SeatCheckPage;
