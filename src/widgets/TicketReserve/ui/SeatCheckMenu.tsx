import down from '@/assets/icons/down.png';
import useModalStore from '@/shared/modals/model/ReserveStore';

const SeatCheckMenu = () => {
  const { openModal } = useModalStore();
  return (
    <div className="mt-[15px] flex w-full justify-end">
      <div
        onClick={() => openModal('TrainNumberChoiceModal')}
        className="shadow-black/4 flex h-[30px] w-[150px] cursor-pointer items-center justify-center gap-[6px] rounded-xs bg-white drop-shadow-[0_0_5px_rgba(0,0,0,0.25)] active:brightness-50"
      >
        <span className="text-xs font-bold">3호차 잔여 23석/60석</span>
        <img src={down} width={11} height={7} />
      </div>
    </div>
  );
};

export default SeatCheckMenu;
