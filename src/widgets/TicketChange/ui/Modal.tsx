import useModalStore from '@/widgets/model/TicketChangeStore';
import TrainNumberChoiceModal from './TrainNumberChocieModal';
import SeatChangeModal from './SeatChangeModal';
import RequestChangeModal from './RequestChangeModal';

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
