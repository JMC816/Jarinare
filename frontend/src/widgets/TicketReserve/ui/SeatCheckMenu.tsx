import down from '@/assets/icons/down.png';
import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '@/widgets/model/ReserveStore';

const SeatCheckMenu = () => {
  const { openModal } = useModalStore();
  const { trainNo } = trainDataStore();
  const { seatsInfo } = useSeatQueryData();

  const trainNoSeatsCount = seatsInfo.filter(
    (item) => item.trainNoId === trainNo,
  ).length;

  return (
    <div
      onClick={() => openModal('TrainNumberChoiceModal')}
      className="flex h-[28px] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 active:brightness-95"
    >
      <span className="text-xs font-bold text-gray-700">
        {trainNo}호차 잔여{' '}
        <span className="text-blue">{trainNoSeatsCount}</span>석/24석
      </span>
      <img src={down} width={9} height={6} />
    </div>
  );
};

export default SeatCheckMenu;
