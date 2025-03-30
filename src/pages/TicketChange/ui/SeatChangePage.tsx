import useModalStore from '@/shared/modals/model/TicketChangeStore';
import Modal from '@/widgets/modals/TicketChange/ui/Modal';
import SeatChangeButton from '@/widgets/TicketChange/ui/SeatChangeButton';
import SeatChangeList from '@/widgets/TicketChange/ui/SeatChangeList';
import SeatChangeMenu from '@/widgets/TicketChange/ui/SeatChangeMenu';
import SeatChangeState from '@/widgets/TicketChange/ui/SeatChangeState';

const SeatChangePage = () => {
  const { isShow, modalType, openModal } = useModalStore();
  return (
    <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
      <SeatChangeMenu />
      <SeatChangeList />
      <SeatChangeState />
      <div className="mt-[10px] flex justify-between gap-x-5">
        <span className="h-12 w-[150px] text-base font-bold text-mediumGray">
          빈 좌석 또는 타 승객 좌석을 선택해주세요
        </span>
        <SeatChangeButton
          onClick={() => openModal('SeatChangeModal')}
          text="0 / 2 선택"
          textColor="white"
          bgColor="lightBlueImpossible"
        />
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default SeatChangePage;
