import useModalStore from '@/shared/modals/model/TicketChangeStore';
import RequestChangeModal from '@/shared/modals/TicketChange/ui/RequestChangeModal';
import SeatChangeModal from '@/shared/modals/TicketChange/ui/SeatChangeModal';
import TrainNumberChoiceModal from '@/shared/modals/TicketChange/ui/TrainNumberChocieModal';

const Modal = () => {
  const { modalType, isShow } = useModalStore();
  return (
    <div className="fixed mx-auto my-0 h-[667px] w-[375px]">
      {isShow == true && modalType == 'TrainNumberChoiceModal' ? (
        <TrainNumberChoiceModal />
      ) : null}
      {isShow == true && modalType == 'SeatChangeModal' ? (
        <SeatChangeModal />
      ) : null}
      {isShow == true && modalType == 'RequestChangeModal' ? (
        <RequestChangeModal />
      ) : null}
    </div>
  );
};

export default Modal;
