import down from '@/assets/icons/down.png';
import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '@/widgets/model/ReserveStore';

const SeatCheckMenu = () => {
  const { openModal } = useModalStore();
  const { trainNo } = trainDataStore();
  const { seatsInfo } = useSeatQueryData();

  const trainNoSeatsCount = seatsInfo.map(
    (item) => item.trainNoId === trainNo,
  ).length;

  return (
    <div className="mt-[15px] flex w-full justify-end">
      <div
        onClick={() => {
          openModal('TrainNumberChoiceModal');
        }}
        className="shadow-black/4 flex h-[30px] w-[150px] cursor-pointer items-center justify-center gap-[6px] rounded-xs bg-white drop-shadow-[0_0_5px_rgba(0,0,0,0.25)] active:brightness-50"
      >
        <span className="text-xs font-bold">
          {trainNo}호차 잔여{' '}
          <span className="text-blue">{trainNoSeatsCount}</span>석/24석
        </span>
        <img src={down} width={11} height={7} />
      </div>
    </div>
  );
};

export default SeatCheckMenu;
