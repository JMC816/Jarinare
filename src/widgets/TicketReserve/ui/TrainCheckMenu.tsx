import down from '@/assets/icons/down.png';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '@/widgets/model/ReserveStore';

const TrainCheckMenu = () => {
  const { openModal } = useModalStore();
  const { trainTypeForView, startTimeForView } = trainDataStore();
  return (
    <div className="mt-[30px] flex w-full gap-[15px]">
      <div
        onClick={() => openModal('TrainChoiceModal')}
        className="shadow-black/4 flex h-[30px] w-[80px] cursor-pointer items-center justify-center gap-[6px] rounded-xs bg-white drop-shadow-[0_0_5px_rgba(0,0,0,0.25)] active:brightness-50"
      >
        <span className="text-xs font-bold">
          {trainTypeForView ? trainTypeForView : '기차 종류'}
        </span>
        <img src={down} width={11} height={7} />
      </div>
      <div
        onClick={() => openModal('TimeChoiceModal')}
        className="shadow-black/4 flex h-[30px] w-[80px] cursor-pointer items-center justify-center gap-[6px] rounded-xs bg-white drop-shadow-[0_0_5px_rgba(0,0,0,0.25)] active:brightness-50"
      >
        <span className="text-xs font-bold">
          {startTimeForView.substring(0, 2)}시 이후
        </span>
        <img src={down} width={11} height={7} />
      </div>
    </div>
  );
};

export default TrainCheckMenu;
