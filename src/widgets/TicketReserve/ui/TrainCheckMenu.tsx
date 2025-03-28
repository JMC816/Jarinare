import down from '@/assets/icons/down.png';
import useModalStore from '@/shared/modals/model/ReserveStore';

const TrainCheckMenu = () => {
  const { openModal } = useModalStore();
  return (
    <div className="mt-[30px] flex w-full gap-[15px]">
      <div
        onClick={() => openModal('TrainChoiceModal')}
        className="shadow-black/4 flex h-[30px] w-[80px] items-center justify-center gap-[6px] rounded-xs bg-white drop-shadow-[0_0_5px_rgba(0,0,0,0.25)]"
      >
        <span className="text-xs font-bold">기차 종류</span>
        <img src={down} width={11} height={7} />
      </div>
      <div
        onClick={() => openModal('TimeChoiceModal')}
        className="shadow-black/4 flex h-[30px] w-[80px] items-center justify-center gap-[6px] rounded-xs bg-white drop-shadow-[0_0_5px_rgba(0,0,0,0.25)]"
      >
        <span className="text-xs font-bold">0시 이후</span>
        <img src={down} width={11} height={7} />
      </div>
    </div>
  );
};

export default TrainCheckMenu;
