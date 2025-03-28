import useModalStore from '@/shared/modals/model/ReserveStore';
import ChoiceResultModal from '@/shared/modals/TicketReserve/ui/ChoiceResultModal';
import CountModal from '@/shared/modals/TicketReserve/ui/CountModal';
import DayModal from '@/shared/modals/TicketReserve/ui/DayModal';
import EndPlaceModal from '@/shared/modals/TicketReserve/ui/EndPlaceModal';
import StartPlaceModal from '@/shared/modals/TicketReserve/ui/StartPlaceModal';
import TimeChoiceModal from '@/shared/modals/TicketReserve/ui/TimeChoiceModal';
import TrainChoiceModal from '@/shared/modals/TicketReserve/ui/TrainChoiceModal';

const Modal = () => {
  const { modalType, isShow } = useModalStore();
  return (
    <div className="fixed mx-auto my-0 h-[667px] w-[375px]">
      {isShow == true && modalType == 'StartPlaceModal' ? (
        <StartPlaceModal />
      ) : null}
      {isShow == true && modalType == 'EndPlaceModal' ? (
        <EndPlaceModal />
      ) : null}
      {isShow == true && modalType == 'DayModal' ? <DayModal /> : null}
      {isShow == true && modalType == 'CountModal' ? <CountModal /> : null}
      {isShow == true && modalType == 'TrainChoiceModal' ? (
        <TrainChoiceModal />
      ) : null}
      {isShow == true && modalType == 'TimeChoiceModal' ? (
        <TimeChoiceModal />
      ) : null}
      {isShow == true && modalType == 'ChoiceResultModal' ? (
        <ChoiceResultModal />
      ) : null}
    </div>
  );
};

export default Modal;
