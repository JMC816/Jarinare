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
        className="flex h-[30px] w-[80px] cursor-pointer items-center justify-center gap-[6px] rounded-xs border border-lightGray bg-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
      >
        <span className="text-xs font-bold">
          {trainTypeForView ? trainTypeForView : '기차 종류'}
        </span>
        <img src={down} width={11} height={7} />
      </div>
      <div
        onClick={() => openModal('TimeChoiceModal')}
        className="flex h-[30px] w-[80px] cursor-pointer items-center justify-center gap-[6px] rounded-xs border border-lightGray bg-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
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
