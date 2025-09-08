import useModalStore from '@/widgets/model/ReserveStore';
import StartPlaceModal from './StartPlaceModal';
import EndPlaceModal from './EndPlaceModal';
import DayModal from './DayModal';
import CountModal from './CountModal';
import TrainChoiceModal from './TrainChoiceModal';
import TimeChoiceModal from './TimeChoiceModal';
import ChoiceResultModal from './ChoiceResultModal';
import TrainNumberChoiceModal from './TrainNumberChocieModal';
import PayModal from './PayModal';

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
      {isShow == true && modalType == 'TrainNumberChoiceModal' ? (
        <TrainNumberChoiceModal />
      ) : null}
      {isShow == true && modalType == 'PayModal' ? <PayModal /> : null}
    </div>
  );
};

export default Modal;
